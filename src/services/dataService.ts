// src/services/dataService.ts
import { ReconnectingWebSocket, ConnectionMonitor } from '../utils/connectionUtils';
import { errorLogger } from '../utils/errorHandling';
import { PerformanceMonitor } from '../utils/performance';
import {
  isValidAggregatorMetrics,
  isValidMQTTMessage,
} from '../utils/validation';
import {
  mqttMessageToWarning,
  mqttMessageToTask,
  generateSensorDataFromMetrics,
  mapStringToSystemStatus
} from '../utils/dataTransform';
import type { Task, Warning, SensorData } from '../types';

// Data service types
export interface AggregatorMetrics {
  total_registos: number;
  tempo_medio_montagem: number;
  total_defeitos: number;
  taxa_sucesso: number;
  por_estacao: {
    [stationId: string]: {
      registos: number;
      defeitos: number;
      tempo_medio: number;
    };
  };
  timestamp: number;
}

export interface MQTTMessage {
  timestamp: number;
  type: string;
  task_id?: string;
  subtask_id?: string;
  status?: string;
  rule_id?: string;
  satisfied?: boolean;
  details?: string;
  message?: string;
  [key: string]: any;
}

export interface DataServiceConfig {
  aggregatorUrl?: string;
  mqttWsUrl?: string;
  retryAttempts?: number;
  retryDelay?: number;
  heartbeatInterval?: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<DataServiceConfig> = {
  aggregatorUrl: 'http://localhost:8000',
  mqttWsUrl: 'ws://localhost:8080/mqtt',
  retryAttempts: 3,
  retryDelay: 2000,
  heartbeatInterval: 30000,
};

class DataService {
  private config: Required<DataServiceConfig>;
  private aggregatorMetrics: AggregatorMetrics | null = null;
  private mqttWs: ReconnectingWebSocket | null = null;
  private connectionMonitor: ConnectionMonitor;
  private performanceMonitor: PerformanceMonitor;
  private isInitialized = false;
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();

  // Data cache
  private sensorDataCache: SensorData | null = null;
  private tasksCache: Task[] = [];
  private warningsCache: Warning[] = [];

  constructor(config: DataServiceConfig = {}) {
    // Merge with environment variables and defaults
    this.config = {
      ...DEFAULT_CONFIG,
      aggregatorUrl: import.meta.env.VITE_AGGREGATOR_URL || config.aggregatorUrl || DEFAULT_CONFIG.aggregatorUrl,
      mqttWsUrl: import.meta.env.VITE_MQTT_WS_URL || config.mqttWsUrl || DEFAULT_CONFIG.mqttWsUrl,
      ...config,
    };

    this.connectionMonitor = new ConnectionMonitor(this.config.heartbeatInterval);
    this.performanceMonitor = new PerformanceMonitor();

    // Initialize subscribers map
    this.subscribers.set('sensorData', []);
    this.subscribers.set('tasks', []);
    this.subscribers.set('warnings', []);
    this.subscribers.set('connection', []);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('[DataService] Initializing...');

      // Validate environment
      // const envValidation = validateEnvironmentVariables();
      // if (!envValidation.valid) {
      //   console.warn('[DataService] Missing environment variables:', envValidation.missing);
      // }

      // Initialize connection monitoring
      this.connectionMonitor.startMonitoring();
      this.connectionMonitor.onStatusChange((status) => {
        this.notifySubscribers('connection', status);
      });

      this.isInitialized = true;
      console.log('[DataService] Initialized successfully');
    } catch (error) {
      const errorInfo = errorLogger.logError(error as Error, { context: 'DataService.initialize' });
      throw new Error(`Failed to initialize DataService: ${errorInfo.message}`);
    }
  }

  // Public API methods
  public async fetchAggregatorMetrics(): Promise<AggregatorMetrics | null> {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized');
    }

    const performanceEnd = this.performanceMonitor.startRenderTimer();

    try {
      const startTime = performance.now();
      const response = await this.fetchWithTimeout(`${this.config.aggregatorUrl}/api/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const latency = performance.now() - startTime;
      this.performanceMonitor.recordApiLatency(latency);

      if (!response.ok) {
        throw new Error(`Aggregator API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!isValidAggregatorMetrics(data)) {
        throw new Error('Invalid aggregator metrics format');
      }

      // Add timestamp if missing
      if (!data.timestamp) {
        data.timestamp = Date.now();
      }

      this.aggregatorMetrics = data;
      this.connectionMonitor.recordActivity();

      // Generate synthetic sensor data from metrics
      this.updateSensorDataFromMetrics(data);

      console.log('[DataService] Fetched aggregator metrics:', data);
      return data;

    } catch (error) {
      const errorInfo = errorLogger.logError(error as Error, {
        context: 'DataService.fetchAggregatorMetrics',
        url: this.config.aggregatorUrl
      });

      // Return cached data if available
      if (this.aggregatorMetrics) {
        console.warn('[DataService] Using cached aggregator metrics due to error');
        return this.aggregatorMetrics;
      }

      throw error;
    } finally {
      performanceEnd();
    }
  }

  public async connectMQTT(): Promise<void> {
    if (this.mqttWs) {
      console.log('[DataService] MQTT already connected');
      return;
    }

    try {
      console.log('[DataService] Connecting to MQTT WebSocket...');

      this.mqttWs = new ReconnectingWebSocket(this.config.mqttWsUrl);

      this.mqttWs.on('open', () => {
        console.log('[DataService] MQTT WebSocket connected');
        this.connectionMonitor.recordActivity();
        this.notifySubscribers('connection', { mqttConnected: true });
      });

      this.mqttWs.on('message', (data: any) => {
        this.handleMQTTMessage(data);
      });

      this.mqttWs.on('close', () => {
        console.log('[DataService] MQTT WebSocket disconnected');
        this.notifySubscribers('connection', { mqttConnected: false });
      });

      this.mqttWs.on('error', (error: any) => {
        errorLogger.logError(error, { context: 'DataService.MQTT' });
      });

      await this.mqttWs.connect();

    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DataService.connectMQTT' });
      throw error;
    }
  }

  public disconnect(): void {
    console.log('[DataService] Disconnecting...');

    if (this.mqttWs) {
      this.mqttWs.disconnect();
      this.mqttWs = null;
    }

    this.connectionMonitor.stopMonitoring();

    // Clear caches
    this.sensorDataCache = null;
    this.tasksCache = [];
    this.warningsCache = [];

    // Clear subscribers
    this.subscribers.clear();

    console.log('[DataService] Disconnected');
  }

  // Subscription methods
  public subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }

    this.subscribers.get(channel)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Getter methods for cached data
  public getSensorData(): SensorData | null {
    return this.sensorDataCache;
  }

  public getTasks(): Task[] {
    return [...this.tasksCache];
  }

  public getWarnings(): Warning[] {
    return [...this.warningsCache];
  }

  public getConnectionStatus() {
    return {
      aggregatorConnected: this.aggregatorMetrics !== null,
      mqttConnected: this.mqttWs !== null,
      ...this.connectionMonitor.getStatus()
    };
  }

  public getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }

  // Private helper methods
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private handleMQTTMessage(data: any): void {
    try {
      if (!isValidMQTTMessage(data)) {
        console.warn('[DataService] Invalid MQTT message format:', data);
        return;
      }

      const startTime = performance.now();

      // Process message and update caches
      this.processMQTTMessage(data);

      const latency = performance.now() - startTime;
      this.performanceMonitor.recordWSLatency(latency);
      this.connectionMonitor.recordActivity();

    } catch (error) {
      errorLogger.logError(error as Error, {
        context: 'DataService.handleMQTTMessage',
        message: data
      });
    }
  }

  private processMQTTMessage(message: MQTTMessage): void {
    // Convert to warning if applicable
    const warning = mqttMessageToWarning(message);
    if (warning) {
      this.warningsCache = [warning, ...this.warningsCache.slice(0, 19)]; // Keep last 20
      this.notifySubscribers('warnings', this.warningsCache);
    }

    // Convert to task if applicable
    const task = mqttMessageToTask(message);
    if (task) {
      const existingIndex = this.tasksCache.findIndex(t => t.id === task.id);
      if (existingIndex >= 0) {
        this.tasksCache[existingIndex] = task;
      } else {
        this.tasksCache.push(task);
      }
      this.notifySubscribers('tasks', this.tasksCache);
    }

    // Update sensor data if relevant
    if (message.type === 'telemetry' || message.type === 'sensor_update') {
      this.updateSensorDataFromMQTT(message);
    }
  }

  private updateSensorDataFromMetrics(metrics: AggregatorMetrics): void {
    const sensorData = generateSensorDataFromMetrics(metrics);
    this.sensorDataCache = sensorData;
    this.notifySubscribers('sensorData', sensorData);
  }

  private updateSensorDataFromMQTT(message: MQTTMessage): void {
    if (!this.sensorDataCache) {
      // Initialize with default values if not exists
      this.sensorDataCache = {
        temperature: 25.0,
        temperatureChange: 0,
        humidity: 45,
        humidityChange: 0,
        pressure: 760,
        powerUsage: 4.2,
        powerUsageChange: 0,
        status: 'Operational',
        maintenanceDate: Date.now() + 86400000 * 7,
      };
    }

    // Update sensor data from MQTT message
    const updated = { ...this.sensorDataCache };
    let hasChanges = false;

    if (message.temperature !== undefined) {
      updated.temperatureChange = message.temperature - updated.temperature;
      updated.temperature = message.temperature;
      hasChanges = true;
    }

    if (message.humidity !== undefined) {
      updated.humidityChange = message.humidity - updated.humidity;
      updated.humidity = message.humidity;
      hasChanges = true;
    }

    if (message.pressure !== undefined) {
      updated.pressure = message.pressure;
      hasChanges = true;
    }

    if (message.powerUsage !== undefined) {
      updated.powerUsageChange = message.powerUsage - updated.powerUsage;
      updated.powerUsage = message.powerUsage;
      hasChanges = true;
    }

    if (message.status) {
      updated.status = mapStringToSystemStatus(message.status);
      hasChanges = true;
    }

    if (hasChanges) {
      this.sensorDataCache = updated;
      this.notifySubscribers('sensorData', updated);
    }
  }

  private notifySubscribers(channel: string, data: any): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          errorLogger.logError(error as Error, {
            context: `DataService.notifySubscribers.${channel}`
          });
        }
      });
    }
  }
}

// Create and export singleton instance
const dataService = new DataService();

export default dataService;
