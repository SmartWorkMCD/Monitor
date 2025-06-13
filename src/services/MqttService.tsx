import mqtt, { type MqttClient } from 'mqtt';
import type {
  ManagementEvent,
  SensorData,
  Task,
  Warning,
  TaskStatus,
  SystemStatus,
  WarningSeverity
} from '../types';

export interface MqttConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  topics: {
    management: string;
    projector: string;
    telemetry: string;
  };
}

export type DataUpdateCallback = {
  onSensorData?: (data: SensorData) => void;
  onTasks?: (tasks: Task[]) => void;
  onWarnings?: (warnings: Warning[]) => void;
  onSystemStatus?: (status: SystemStatus) => void;
  onConnectionChange?: (connected: boolean) => void;
};

export class MqttService {
  private client: MqttClient | null = null;
  private config: MqttConfig;
  private callbacks: DataUpdateCallback = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // Internal data stores
  private currentTasks: Map<string, Task> = new Map();
  private currentWarnings: Warning[] = [];
  private currentSensorData: SensorData = {
    temperature: 25.0,
    temperatureChange: 0,
    humidity: 50,
    humidityChange: 0,
    pressure: 760,
    powerUsage: 4.0,
    powerUsageChange: 0,
    status: 'Operational',
    maintenanceDate: Date.now() + 86400000 * 7
  };

  constructor(config: MqttConfig) {
    this.config = config;
  }

  async connect(callbacks: DataUpdateCallback): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.callbacks = callbacks;

        const clientOptions: mqtt.IClientOptions = {
          clean: true,
          connectTimeout: 4000,
          clientId: `monitor_dashboard_${  Math.random().toString(16).substr(2, 8)}`,
          keepalive: 60,
          reconnectPeriod: 5000,
        };

        if (this.config.username && this.config.password) {
          clientOptions.username = this.config.username;
          clientOptions.password = this.config.password;
        }

        console.log(`Connecting to MQTT broker: ${this.config.brokerUrl}`);
        this.client = mqtt.connect(this.config.brokerUrl, clientOptions);

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.callbacks.onConnectionChange?.(true);
          this.subscribeToTopics();
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('MQTT connection error:', error);
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
          reject(error);
        });

        this.client.on('close', () => {
          console.log('MQTT connection closed');
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
          this.handleReconnect();
        });

        this.client.on('offline', () => {
          console.log('MQTT client offline');
          this.isConnected = false;
          this.callbacks.onConnectionChange?.(false);
        });

        this.client.on('reconnect', () => {
          console.log('MQTT client reconnecting...');
        });

        this.client.on('message', this.handleMessage.bind(this));

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      this.reconnectTimeout = setTimeout(() => {
        if (this.client && !this.isConnected) {
          this.client.reconnect();
        }
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private subscribeToTopics(): void {
    if (!this.client) return;

    const topics = [
      this.config.topics.management,
      this.config.topics.projector,
      this.config.topics.telemetry
    ];

    topics.forEach(topic => {
      this.client?.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = JSON.parse(payload.toString());
      console.log(`Received message on ${topic}:`, message);

      switch (topic) {
        case this.config.topics.management:
          this.handleManagementMessage(message);
          break;
        case this.config.topics.projector:
          this.handleProjectorMessage(message);
          break;
        case this.config.topics.telemetry:
          this.handleTelemetryMessage(message);
          break;
      }
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }

  private handleManagementMessage(message: any): void {
    const event = message as ManagementEvent;

    switch (event.type) {
      case 'system_status':
        this.updateSystemStatus(event.status as SystemStatus, event.message);
        break;

      case 'task_update':
        this.updateTask(event);
        break;

      case 'rule_evaluation':
        if (!event.satisfied) {
          this.addWarning(event);
        }
        break;

      case 'state_transition':
        this.updateSystemState(event);
        break;

      case 'user_action':
        console.log('User action received:', event);
        break;

      case 'performance_metrics':
        console.log('Performance metrics received:', event);
        break;
    }
  }

  private handleProjectorMessage(message: any): void {
    // Handle projector control messages for task metadata
    if (message.task_id && message.progress !== undefined) {
      this.updateTaskProgress(message.task_id, message.progress);
    }
  }

  private handleTelemetryMessage(message: any): void {
    // Handle telemetry data for task completion timing
    if (message.subtask_id && message.duration) {
      this.updateTaskTiming(message.subtask_id, message.duration);
    }
  }

  private updateSystemStatus(status: SystemStatus, message: string): void {
    this.currentSensorData.status = status;

    // Create a warning for non-operational status
    if (status !== 'Operational' && message) {
      // const severity: WarningSeverity = status === 'Critical' ? 'high' : 'medium';
      this.addWarning({
        type: 'rule_evaluation',
        timestamp: Date.now() / 1000,
        rule_id: 'system_status',
        satisfied: false,
        details: message
      });
    }

    this.callbacks.onSensorData?.(this.currentSensorData);
    this.callbacks.onSystemStatus?.(status);
  }

  private updateTask(event: any): void {
    const taskId = event.subtask_id || event.task_id;
    const status: TaskStatus = this.mapTaskStatus(event.status);

    const task: Task = {
      id: parseInt(taskId.replace(/\D/g, '')) || Date.now(),
      title: this.generateTaskTitle(taskId),
      status,
      deadline: Date.now() + 86400000 // 24 hours from now
    };

    this.currentTasks.set(taskId, task);
    this.callbacks.onTasks?.(Array.from(this.currentTasks.values()));
  }

  private updateTaskProgress(taskId: string, progress: number): void {
    const task = this.currentTasks.get(taskId);
    if (task) {
      // Update task status based on progress
      if (progress >= 100) {
        task.status = 'completed';
      } else if (progress > 0) {
        task.status = 'in-progress';
      }

      this.currentTasks.set(taskId, task);
      this.callbacks.onTasks?.(Array.from(this.currentTasks.values()));
    }
  }

  private updateTaskTiming(subtaskId: string, duration: number): void {
    console.log(`Task ${subtaskId} completed in ${duration} seconds`);
  }

  private addWarning(event: any): void {
    const severity: WarningSeverity = this.mapSeverity(event.details || event.rule_id);

    const warning: Warning = {
      id: Date.now(),
      severity,
      message: event.details || `Rule ${event.rule_id} evaluation failed`,
      timestamp: (event.timestamp * 1000) || Date.now()
    };

    this.currentWarnings.unshift(warning);

    // Keep only last 50 warnings
    if (this.currentWarnings.length > 50) {
      this.currentWarnings = this.currentWarnings.slice(0, 50);
    }

    this.callbacks.onWarnings?.(this.currentWarnings);
  }

  private updateSystemState(event: any): void {
    console.log(`State transition: ${event.from_state} -> ${event.to_state}`);
  }

  private mapTaskStatus(status: string): TaskStatus {
    const statusMap: Record<string, TaskStatus> = {
      'started': 'in-progress',
      'in_progress': 'in-progress',
      'waiting_confirmation': 'in-progress',
      'completed': 'completed',
      'failed': 'pending'
    };

    return statusMap[status] || 'pending';
  }

  private mapSeverity(details: string): WarningSeverity {
    const lowerDetails = details.toLowerCase();

    if (lowerDetails.includes('critical') || lowerDetails.includes('error') || lowerDetails.includes('failed')) {
      return 'high';
    } else if (lowerDetails.includes('warning') || lowerDetails.includes('anomaly')) {
      return 'medium';
    }

    return 'low';
  }

  private generateTaskTitle(taskId: string): string {
    const taskTitles: Record<string, string> = {
      'T1A': 'Wrap Yellow Candies',
      'T1B': 'Wrap Blue Candies',
      'T1C': 'Wrap Green Candies',
      'T1D': 'Wrap Red Candies',
      'T2A': 'Assemble Candy Boxes',
      'T3A': 'Insert Cardboard',
      'T3B': 'Apply Adhesive',
      'T3C': 'Decorative Finishing'
    };

    return taskTitles[taskId] || `Task ${taskId}`;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.isConnected = false;
      this.callbacks.onConnectionChange?.(false);
    }
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client?.connected === true;
  }

  // Method to simulate sensor data updates (if not coming from MQTT)
  simulateSensorUpdates(): void {
    const simulationInterval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(simulationInterval);
        return;
      }

      // Small random changes to sensor data
      this.currentSensorData.temperature += Math.round((Math.random() - 0.5) * 64)/128;
      this.currentSensorData.humidity += Math.round((Math.random() - 0.5) * 256)/128;
      this.currentSensorData.powerUsage += Math.round((Math.random() - 0.5) * 16)/128;

      // Update temperature and power change indicators
      this.currentSensorData.temperatureChange = Math.round((Math.random() - 0.5) * 256)/128;
      this.currentSensorData.humidityChange = Math.round((Math.random() - 0.5) * 384)/128;
      this.currentSensorData.powerUsageChange = Math.round((Math.random() - 0.5) * 32)/128;

      this.callbacks.onSensorData?.(this.currentSensorData);
    }, 5000);
  }
}
