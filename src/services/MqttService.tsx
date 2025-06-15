import mqtt, { type MqttClient } from 'mqtt';
import type {
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

// Message types from Workstation Brain
export type SystemStatusEvent = {
  timestamp: number;
  type: "system_status";
  status: string;
  message: string;
};

export type StateTransitionEvent = {
  timestamp: number;
  type: "state_transition";
  from_state: string;
  to_state: string;
};

export type TaskUpdateEvent = {
  timestamp: number;
  type: "task_update";
  task_id: string;
  subtask_id: string;
  status: string;
  progress: number;
};

export type RuleEvaluationEvent = {
  timestamp: number;
  type: "rule_evaluation";
  rule_id: string;
  satisfied: boolean;
  details: string;
};

export type UserActionEvent = {
  timestamp: number;
  type: "user_action";
  action: string;
  details: Record<string, any>;
};

export type PerformanceMetricsEvent = {
  timestamp: number;
  type: "performance_metrics";
  metrics: Record<string, any>;
};

export type ManagementEvent =
  | SystemStatusEvent
  | StateTransitionEvent
  | TaskUpdateEvent
  | RuleEvaluationEvent
  | UserActionEvent
  | PerformanceMetricsEvent;

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
          clientId: `monitor_dashboard_${Math.random().toString(16).substr(2, 8)}`,
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

  private handleManagementMessage(message: ManagementEvent): void {
    switch (message.type) {
      case 'system_status':
        this.updateSystemStatus(message);
        break;

      case 'task_update':
        this.updateTask(message);
        break;

      case 'rule_evaluation':
        this.handleRuleEvaluation(message);
        break;

      case 'state_transition':
        this.updateSystemState(message);
        break;

      case 'user_action':
        console.log('User action received:', message);
        break;

      case 'performance_metrics':
        this.updatePerformanceMetrics(message);
        break;
    }
  }

  private handleProjectorMessage(message: any): void {
    // Handle projector messages for additional context
    if (message.task && message.subtask && message.progress !== undefined) {
      // Update task progress from projector
      console.log(`Projector task update: ${message.task} - ${message.subtask} (${message.progress}%)`);
    }
  }

  private handleTelemetryMessage(message: any): void {
    // Handle telemetry data for sensor metrics
    if (message.subtask_id && message.duration) {
      console.log(`Task completion timing: ${message.subtask_id} - ${message.duration}s`);
    }
  }

  private updateSystemStatus(event: SystemStatusEvent): void {
    // Map workstation states to system status
    const statusMapping: Record<string, SystemStatus> = {
      'idle': 'Operational',
      'waiting': 'Operational',
      'cleaning': 'Operational',
      'executing': 'Operational',
      'waiting_confirmation': 'Warning',
      'completing': 'Operational',
      'task_completed': 'Operational',
      'error': 'Critical'
    };

    const systemStatus = statusMapping[event.status] || 'Operational';

    // Update sensor data with system status
    this.currentSensorData = {
      ...this.currentSensorData,
      status: systemStatus
    };

    // Add warning for non-operational states
    if (event.status === 'waiting_confirmation' || event.status === 'error') {
      const severity: WarningSeverity = event.status === 'error' ? 'high' : 'medium';
      this.addWarning({
        severity,
        message: event.message || `System status: ${event.status}`,
        timestamp: event.timestamp * 1000 // Convert to milliseconds
      });
    }

    this.callbacks.onSensorData?.(this.currentSensorData);
    this.callbacks.onSystemStatus?.(systemStatus);
  }

  private updateTask(event: TaskUpdateEvent): void {
    const taskId = event.subtask_id || event.task_id;
    const status: TaskStatus = this.mapTaskStatus(event.status);

    // Generate human-readable task titles
    const taskTitles: Record<string, string> = {
      'T1A': 'Wrap Red Candies',
      'T1B': 'Wrap Green Candies',
      'T1C': 'Wrap Blue Candies',
      'T2A': 'Assemble Candy Boxes',
      'T3A': 'Insert Cardboard',
      'T3B': 'Apply Adhesive',
      'T3C': 'Decorative Finishing'
    };

    const task: Task = {
      id: parseInt(taskId.replace(/\D/g, '')) || Date.now(),
      title: taskTitles[taskId] || `Task ${taskId}`,
      status,
      deadline: Date.now() + 86400000 // 24 hours from now
    };

    this.currentTasks.set(taskId, task);
    this.callbacks.onTasks?.(Array.from(this.currentTasks.values()));
  }

  private handleRuleEvaluation(event: RuleEvaluationEvent): void {
    if (!event.satisfied) {
      const severity: WarningSeverity = this.mapSeverity(event.details || event.rule_id);

      this.addWarning({
        severity,
        message: event.details || `Rule ${event.rule_id} evaluation failed`,
        timestamp: event.timestamp * 1000
      });
    }
  }

  private updateSystemState(event: StateTransitionEvent): void {
    console.log(`State transition: ${event.from_state} → ${event.to_state}`);

    // Update sensor data based on state transitions
    if (event.to_state === 'executing_task') {
      this.currentSensorData.powerUsage += 0.5; // Simulate increased power usage
      this.currentSensorData.powerUsageChange = 0.5;
    } else if (event.to_state === 'cleaning') {
      this.currentSensorData.powerUsage -= 0.3;
      this.currentSensorData.powerUsageChange = -0.3;
    }

    this.callbacks.onSensorData?.(this.currentSensorData);
  }

  private updatePerformanceMetrics(event: PerformanceMetricsEvent): void {
    const metrics = event.metrics;

    if (metrics.task_completion_time && metrics.subtask_id) {
      console.log(`Performance: ${metrics.subtask_id} completed in ${metrics.task_completion_time}s`);

      // Add performance info as low-priority warning
      this.addWarning({
        severity: 'low',
        message: `Task ${metrics.subtask_id} completed in ${metrics.task_completion_time.toFixed(1)}s`,
        timestamp: Date.now()
      });
    }
  }

  private addWarning(warning: Omit<Warning, 'id'>): void {
    const newWarning: Warning = {
      id: Date.now(),
      ...warning
    };

    this.currentWarnings.unshift(newWarning);

    // Keep only last 50 warnings
    if (this.currentWarnings.length > 50) {
      this.currentWarnings = this.currentWarnings.slice(0, 50);
    }

    this.callbacks.onWarnings?.(this.currentWarnings);
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
    } else if (lowerDetails.includes('warning') || lowerDetails.includes('anomaly') || lowerDetails.includes('confirmation')) {
      return 'medium';
    }

    return 'low';
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

  // Simulate sensor updates when no real data is available
  simulateSensorUpdates(): void {
    const simulationInterval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(simulationInterval);
        return;
      }

      // Small random changes to sensor data
      this.currentSensorData.temperature += (Math.random() - 0.5) * 2;
      this.currentSensorData.humidity += (Math.random() - 0.5) * 3;

      // Keep values in reasonable ranges
      this.currentSensorData.temperature = Math.max(20, Math.min(35, this.currentSensorData.temperature));
      this.currentSensorData.humidity = Math.max(30, Math.min(70, this.currentSensorData.humidity));

      // Update change indicators
      this.currentSensorData.temperatureChange = (Math.random() - 0.5) * 2;
      this.currentSensorData.humidityChange = (Math.random() - 0.5) * 3;
      this.currentSensorData.powerUsageChange = (Math.random() - 0.5) * 0.5;

      this.callbacks.onSensorData?.(this.currentSensorData);
    }, 10000); // Update every 10 seconds
  }
}
