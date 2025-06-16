import mqtt, { type MqttClient } from 'mqtt';
import type {
  SensorData,
  Task,
  Warning,
  TaskStatus,
  SystemStatus,
  WarningSeverity,
  CandyDetection,
  HandPosition,
  GridActivity,
  TaskProgress,
  NeighborsData
} from '../types';

export interface MqttConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  topics: {
    management: string;
    projector: string;
    telemetry: string;
    candy?: string;
    hand?: string;
    task_assignment?: string;
    task_publish?: string;
    task_subscribe?: string;
    neighbors_update?: string;
    station_neighbors?: string;
    station_version?: string;
    station_is_master?: string;
    topology_positions?: string;
    topology_graph?: string;
    update_command?: string;
  };
}

export type DataUpdateCallback = {
  onSensorData?: (data: SensorData) => void;
  onTasks?: (tasks: Task[]) => void;
  onWarnings?: (warnings: Warning[]) => void;
  onSystemStatus?: (status: SystemStatus) => void;
  onConnectionChange?: (connected: boolean) => void;
  onCandyDetection?: (detection: CandyDetection) => void;
  onHandPosition?: (position: HandPosition) => void;
  onGridActivity?: (activity: GridActivity) => void;
  onTaskProgress?: (progress: TaskProgress) => void;
  onNeighborsData?: (data: NeighborsData) => void;
};

// Enhanced message types
export type ManagementEvent =
  | SystemStatusEvent
  | StateTransitionEvent
  | TaskUpdateEvent
  | RuleEvaluationEvent
  | UserActionEvent
  | PerformanceMetricsEvent;

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
  product_id?: string;
  duration?: number;
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

export class MqttService {
  private client: MqttClient | null = null;
  private config: MqttConfig;
  private callbacks: DataUpdateCallback = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageCount = 0;
  private errorCount = 0;
  private subscribedTopics: string[] = [];

  // Enhanced internal data stores
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

  // Real-time data stores
  private currentCandyDetection: CandyDetection | null = null;
  private currentHandPosition: HandPosition | null = null;
  private currentGridActivity: GridActivity = {
    rows: 6,
    cols: 8,
    image_width: 1920,
    image_height: 1080,
    active_cells: [],
    confirmation_cell: { row: 2, col: 3 },
    validation_area: { x_min: 0.3, y_min: 0.3, x_max: 0.7, y_max: 0.7, percentage: 16 }
  };
  private currentTaskProgress: TaskProgress = {
    current_tasks: [],
    completed_tasks: [],
    task_queue: []
  };
  private currentNeighborsData: NeighborsData = {
    stations: [],
    topology: { positions: {}, connections: [], graph: { nodes: [], edges: [] } },
    ble_connections: [],
    last_update: 0
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
          will: {
            topic: `${this.config.topics.management}/disconnect`,
            payload: JSON.stringify({
              timestamp: Date.now() / 1000,
              type: 'client_disconnect',
              client_id: `monitor_dashboard`
            }),
            qos: 1,
            retain: false
          }
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
          this.updateConnectionStatus();
          this.subscribeToTopics();
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('MQTT connection error:', error);
          this.errorCount++;
          this.isConnected = false;
          this.updateConnectionStatus();
          reject(error);
        });

        this.client.on('close', () => {
          console.log('MQTT connection closed');
          this.isConnected = false;
          this.updateConnectionStatus();
          this.handleReconnect();
        });

        this.client.on('offline', () => {
          console.log('MQTT client offline');
          this.isConnected = false;
          this.updateConnectionStatus();
        });

        this.client.on('reconnect', () => {
          console.log(`MQTT client reconnecting... (attempt ${this.reconnectAttempts + 1})`);
          this.reconnectAttempts++;
        });

        this.client.on('message', this.handleMessage.bind(this));

        this.client.on('packetsend', () => {
          // Track outgoing messages for diagnostics
        });

        this.client.on('packetreceive', () => {
          this.messageCount++;
          this.updateConnectionStatus();
        });

      } catch (error) {
        this.errorCount++;
        reject(error);
      }
    });
  }

  private updateConnectionStatus(): void {
    // const status: ConnectionStatus = {
    //   mqtt_connected: this.isConnected,
    //   last_data_received: Date.now(),
    //   topics_subscribed: this.subscribedTopics,
    //   message_count: this.messageCount,
    //   error_count: this.errorCount
    // };

    this.callbacks.onConnectionChange?.(this.isConnected);
  }

  private handleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
      console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

      this.reconnectTimeout = setTimeout(() => {
        if (this.client && !this.isConnected) {
          this.client.reconnect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.addWarning({
        severity: 'high',
        message: 'Unable to reconnect to Workstation Brain after multiple attempts',
        timestamp: Date.now()
      });
    }
  }

  private subscribeToTopics(): void {
    if (!this.client) return;

    const topics = [
      this.config.topics.management,
      this.config.topics.projector,
      this.config.topics.telemetry,
      this.config.topics.candy,
      this.config.topics.hand,
      this.config.topics.task_assignment,
      this.config.topics.neighbors_update,
      this.config.topics.station_neighbors,
      this.config.topics.topology_positions
    ].filter(Boolean) as string[];

    this.subscribedTopics = [];

    topics.forEach(topic => {
      this.client?.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
          this.errorCount++;
        } else {
          console.log(`Subscribed to ${topic}`);
          this.subscribedTopics.push(topic);
        }
      });
    });

    this.updateConnectionStatus();
  }

  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = JSON.parse(payload.toString());

      // Enhanced logging with topic classification
      const topicType = this.classifyTopic(topic);
      console.log(`[${topicType}] Received on ${topic}:`, message);

      this.messageCount++;

      switch (true) {
        case topic === this.config.topics.management:
          this.handleManagementMessage(message);
          break;
        case topic === this.config.topics.candy:
          this.handleCandyDetectionMessage(message);
          break;
        case topic === this.config.topics.hand:
          this.handleHandTrackingMessage(message);
          break;
        case topic === this.config.topics.task_assignment:
          this.handleTaskAssignmentMessage(message);
          break;
        case topic === this.config.topics.neighbors_update:
          this.handleNeighborsUpdateMessage(message);
          break;
        case topic?.includes('station/') && topic?.includes('/neighbors'):
          this.handleStationNeighborsMessage(message, topic);
          break;
        case topic === this.config.topics.topology_positions:
          this.handleTopologyMessage(message);
          break;
        case topic === this.config.topics.projector:
          this.handleProjectorMessage(message);
          break;
        case topic === this.config.topics.telemetry:
          this.handleTelemetryMessage(message);
          break;
        default:
          console.log(`Unhandled topic: ${topic}`);
      }

      this.updateConnectionStatus();
    } catch (error) {
      console.error(`Error parsing MQTT message from ${topic}:`, error);
      this.errorCount++;
      this.updateConnectionStatus();
    }
  }

  private classifyTopic(topic: string): string {
    if (topic.includes('management')) return 'MGMT';
    if (topic.includes('candy') || topic.includes('objdet')) return 'VISION';
    if (topic.includes('hand')) return 'TRACKING';
    if (topic.includes('task')) return 'TASK';
    if (topic.includes('neighbor') || topic.includes('station')) return 'NETWORK';
    if (topic.includes('telemetry')) return 'METRICS';
    if (topic.includes('projector')) return 'DISPLAY';
    return 'OTHER';
  }

  private handleCandyDetectionMessage(message: any): void {
    try {
      if (message.detections && Array.isArray(message.detections)) {
        const candyDetection: CandyDetection = {
          detections: message.detections,
          timestamp: message.timestamp || Date.now(),
          total_candies: message.total_candies || message.detections.length,
          colors_detected: message.colors_detected || {},
          in_validation_area: message.in_validation_area || false
        };

        this.currentCandyDetection = candyDetection;
        this.callbacks.onCandyDetection?.(candyDetection);
      }
    } catch (error) {
      console.error('Error processing candy detection message:', error);
      this.errorCount++;
    }
  }

  private handleHandTrackingMessage(message: any): void {
    try {
      if (message.left_hand || message.right_hand) {
        const handPosition: HandPosition = {
          left_hand: message.left_hand,
          right_hand: message.right_hand,
          timestamp: message.timestamp || Date.now(),
          grid_cell: message.grid_cell,
          in_confirmation_area: message.in_confirmation_area || false
        };

        this.currentHandPosition = handPosition;
        this.callbacks.onHandPosition?.(handPosition);

        // Update grid activity if hand is in a grid cell
        if (message.grid_cell) {
          this.updateGridActivityFromHand(message.grid_cell);
        }
      }
    } catch (error) {
      console.error('Error processing hand tracking message:', error);
      this.errorCount++;
    }
  }

  private updateGridActivityFromHand(gridCell: { row: number; col: number }): void {
    const updated = { ...this.currentGridActivity };

    // Add or update active cell
    const existingIndex = updated.active_cells.findIndex(
      cell => cell.row === gridCell.row && cell.col === gridCell.col
    );

    if (existingIndex === -1) {
      updated.active_cells.push(gridCell);
    }

    // Keep only recent active cells (last 5)
    if (updated.active_cells.length > 5) {
      updated.active_cells = updated.active_cells.slice(-5);
    }

    this.currentGridActivity = updated;
    this.callbacks.onGridActivity?.(updated);
  }

  private handleTaskAssignmentMessage(message: any): void {
    try {
      if (message.tasks) {
        // Process task division assignments
        Object.entries(message.tasks).forEach(([taskId, subtasks]) => {
          if (Array.isArray(subtasks)) {
            subtasks.forEach(subtaskId => {
              this.updateTaskFromAssignment(taskId, subtaskId as string, message.products);
            });
          }
        });
      }
    } catch (error) {
      console.error('Error processing task assignment message:', error);
      this.errorCount++;
    }
  }

  private updateTaskFromAssignment(taskId: string, subtaskId: string, products: any): void {
    const task: Task = {
      id: parseInt(subtaskId.replace(/\D/g, '')) || Date.now(),
      title: this.getTaskTitle(subtaskId),
      status: 'pending',
      deadline: Date.now() + 86400000, // 24 hours from now
      task_id: taskId,
      subtask_id: subtaskId,
      product_id: products ? Object.keys(products)[0] : undefined
    };

    this.currentTasks.set(subtaskId, task);
    this.callbacks.onTasks?.(Array.from(this.currentTasks.values()));
  }

  private handleNeighborsUpdateMessage(message: any): void {
    try {
      if (message.stations) {
        this.currentNeighborsData = {
          ...this.currentNeighborsData,
          stations: message.stations,
          last_update: Date.now()
        };
        this.callbacks.onNeighborsData?.(this.currentNeighborsData);
      }
    } catch (error) {
      console.error('Error processing neighbors update:', error);
      this.errorCount++;
    }
  }

  private handleStationNeighborsMessage(message: any, topic: string): void {
    try {
      const stationId = topic.split('/')[1]; // Extract station ID from topic
      if (message.neighbors) {
        // Update BLE connections for this station
        const existingConnectionIndex = this.currentNeighborsData.ble_connections.findIndex(
          conn => conn.station === stationId
        );

        const connectionData = {
          station: stationId,
          left_neighbor: message.left_neighbor,
          right_neighbor: message.right_neighbor,
          timestamp: Date.now(),
          scan_results: message.scan_results
        };

        if (existingConnectionIndex >= 0) {
          this.currentNeighborsData.ble_connections[existingConnectionIndex] = connectionData;
        } else {
          this.currentNeighborsData.ble_connections.push(connectionData);
        }

        this.callbacks.onNeighborsData?.(this.currentNeighborsData);
      }
    } catch (error) {
      console.error('Error processing station neighbors message:', error);
      this.errorCount++;
    }
  }

  private handleTopologyMessage(message: any): void {
    try {
      if (message.positions || message.connections) {
        this.currentNeighborsData = {
          ...this.currentNeighborsData,
          topology: {
            positions: message.positions || this.currentNeighborsData.topology.positions,
            connections: message.connections || this.currentNeighborsData.topology.connections,
            graph: message.graph || this.currentNeighborsData.topology.graph
          }
        };
        this.callbacks.onNeighborsData?.(this.currentNeighborsData);
      }
    } catch (error) {
      console.error('Error processing topology message:', error);
      this.errorCount++;
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
    if (message.task && message.subtask && message.progress !== undefined) {
      console.log(`Projector task update: ${message.task} - ${message.subtask} (${message.progress}%)`);

      // Update task progress from projector
      const existingTask = this.currentTasks.get(message.subtask);
      if (existingTask) {
        existingTask.progress = message.progress / 100; // Convert percentage to decimal
        this.currentTasks.set(message.subtask, existingTask);
        this.callbacks.onTasks?.(Array.from(this.currentTasks.values()));
      }
    }
  }

  private handleTelemetryMessage(message: any): void {
    if (message.subtask_id && message.duration) {
      console.log(`Task completion timing: ${message.subtask_id} - ${message.duration}s`);

      // Update task progress with completion data
      const completedTask = {
        task_id: message.task_id || message.subtask_id,
        subtask_id: message.subtask_id,
        duration: message.duration,
        timestamp: Date.now(),
        product_id: message.product_id,
        success: message.success !== false // Default to true unless explicitly false
      };

      this.currentTaskProgress.completed_tasks.unshift(completedTask);

      // Keep only last 50 completed tasks
      if (this.currentTaskProgress.completed_tasks.length > 50) {
        this.currentTaskProgress.completed_tasks = this.currentTaskProgress.completed_tasks.slice(0, 50);
      }

      this.callbacks.onTaskProgress?.(this.currentTaskProgress);
    }
  }

  private updateSystemStatus(event: SystemStatusEvent): void {
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

    this.currentSensorData = {
      ...this.currentSensorData,
      status: systemStatus
    };

    if (event.status === 'waiting_confirmation' || event.status === 'error') {
      const severity: WarningSeverity = event.status === 'error' ? 'high' : 'medium';
      this.addWarning({
        severity,
        message: event.message || `System status: ${event.status}`,
        timestamp: event.timestamp * 1000
      });
    }

    this.callbacks.onSensorData?.(this.currentSensorData);
    this.callbacks.onSystemStatus?.(systemStatus);
  }

  private updateTask(event: TaskUpdateEvent): void {
    const taskId = event.subtask_id || event.task_id;
    const status: TaskStatus = this.mapTaskStatus(event.status);

    const task: Task = {
      id: parseInt(taskId.replace(/\D/g, '')) || Date.now(),
      title: this.getTaskTitle(taskId),
      status,
      deadline: Date.now() + 86400000, // 24 hours from now
      task_id: event.task_id,
      subtask_id: event.subtask_id,
      progress: event.progress,
      duration: event.duration,
      product_id: event.product_id
    };

    this.currentTasks.set(taskId, task);

    // Update current tasks in task progress
    const currentTaskExecution = {
      task_id: event.task_id,
      subtask_id: event.subtask_id,
      status,
      progress: event.progress,
      start_time: Date.now(),
      product_id: event.product_id
    };

    const existingIndex = this.currentTaskProgress.current_tasks.findIndex(
      t => t.subtask_id === event.subtask_id
    );

    if (existingIndex >= 0) {
      this.currentTaskProgress.current_tasks[existingIndex] = currentTaskExecution;
    } else {
      this.currentTaskProgress.current_tasks.push(currentTaskExecution);
    }

    this.callbacks.onTasks?.(Array.from(this.currentTasks.values()));
    this.callbacks.onTaskProgress?.(this.currentTaskProgress);
  }

  private handleRuleEvaluation(event: RuleEvaluationEvent): void {
    if (!event.satisfied) {
      const severity: WarningSeverity = this.mapSeverity(event.details || event.rule_id);
      this.addWarning({
        severity,
        message: event.details || `Rule ${event.rule_id} evaluation failed`,
        timestamp: event.timestamp * 1000,
        rule_id: event.rule_id
      });
    }
  }

  private updateSystemState(event: StateTransitionEvent): void {
    console.log(`State transition: ${event.from_state} → ${event.to_state}`);

    if (event.to_state === 'executing_task') {
      this.currentSensorData.powerUsage += 0.5;
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

    if (this.currentWarnings.length > 100) {
      this.currentWarnings = this.currentWarnings.slice(0, 100);
    }

    this.callbacks.onWarnings?.(this.currentWarnings);
  }

  private getTaskTitle(taskId: string): string {
    const taskTitles: Record<string, string> = {
      'T1A': 'Wrap Red Candies',
      'T1B': 'Wrap Green Candies',
      'T1C': 'Wrap Blue Candies',
      'T2A': 'Assemble Candy Boxes',
      'T3A': 'Insert Cardboard',
      'T3B': 'Apply Adhesive',
      'T3C': 'Decorative Finishing'
    };
    return taskTitles[taskId] || `Task ${taskId}`;
  }

  private mapTaskStatus(status: string): TaskStatus {
    const statusMap: Record<string, TaskStatus> = {
      'started': 'in-progress',
      'in_progress': 'in-progress',
      'waiting_confirmation': 'waiting_confirmation',
      'completed': 'completed',
      'failed': 'failed'
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

  // Enhanced simulation with more realistic data
  simulateSensorUpdates(): void {
    if (!this.isConnected) return;

    const simulationInterval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(simulationInterval);
        return;
      }

      // Simulate sensor changes
      this.currentSensorData.temperature += (Math.random() - 0.5) * 2;
      this.currentSensorData.humidity += (Math.random() - 0.5) * 3;

      this.currentSensorData.temperature = Math.max(20, Math.min(35, this.currentSensorData.temperature));
      this.currentSensorData.humidity = Math.max(30, Math.min(70, this.currentSensorData.humidity));

      this.currentSensorData.temperatureChange = (Math.random() - 0.5) * 2;
      this.currentSensorData.humidityChange = (Math.random() - 0.5) * 3;
      this.currentSensorData.powerUsageChange = (Math.random() - 0.5) * 0.5;

      this.callbacks.onSensorData?.(this.currentSensorData);

      // Simulate occasional warnings
      if (Math.random() < 0.1) {
        const severities: WarningSeverity[] = ['low', 'medium', 'high'];
        const messages = [
          'Sensor reading fluctuation detected',
          'Minor calibration drift observed',
          'Routine maintenance reminder',
          'Performance optimization suggested'
        ];

        this.addWarning({
          severity: severities[Math.floor(Math.random() * severities.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: Date.now()
        });
      }

    }, 10000);
  }

  // Diagnostic methods
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      reconnectAttempts: this.reconnectAttempts,
      subscribedTopics: this.subscribedTopics.length,
      clientId: this.client?.options?.clientId
    };
  }

  getDataStats() {
    return {
      tasksCount: this.currentTasks.size,
      warningsCount: this.currentWarnings.length,
      lastCandyDetection: this.currentCandyDetection?.timestamp,
      lastHandPosition: this.currentHandPosition?.timestamp,
      activeCells: this.currentGridActivity.active_cells.length,
      completedTasks: this.currentTaskProgress.completed_tasks.length,
      connectedStations: this.currentNeighborsData.stations.length
    };
  }
}
