import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { MqttService } from "../services/MqttService";
import { mqttConfig } from "../mqtt.config";
import type {
  SensorData,
  Task,
  Warning,
  SystemStatus,
  CandyDetection,
  HandPosition,
  GridActivity,
  RealTimeMetrics,
  NeighborsData,
  ConnectionStatus,
  TaskProgress
} from "../types";

interface DataState {
  sensorData: SensorData;
  tasks: Task[];
  warnings: Warning[];
  systemStatus: SystemStatus;
  isConnected: boolean;
  candyDetection: CandyDetection | null;
  handPosition: HandPosition | null;
  gridActivity: GridActivity;
  taskProgress: TaskProgress;
  realTimeMetrics: RealTimeMetrics;
  neighborsData: NeighborsData;
  connectionStatus: ConnectionStatus;
  lastUpdate: number;
}

interface ManagementContextType extends DataState {
  mqttService: MqttService;
  reconnect: () => Promise<void>;
  clearWarnings: () => void;
  acknowledgeWarning: (warningId: number) => void;
  exportWarnings: () => void;
  retryConnection: () => void;
  getConnectionHealth: () => 'healthy' | 'warning' | 'critical';
}

const defaultSensorData: SensorData = {
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

const defaultGridActivity: GridActivity = {
  rows: 6,
  cols: 8,
  image_width: 1920,
  image_height: 1080,
  active_cells: [],
  confirmation_cell: { row: 2, col: 3 },
  validation_area: {
    x_min: 0.3,
    y_min: 0.3,
    x_max: 0.7,
    y_max: 0.7,
    percentage: 16
  }
};

const defaultTaskProgress: TaskProgress = {
  current_tasks: [],
  completed_tasks: [],
  task_queue: [],
  active_product: undefined
};

const defaultRealTimeMetrics: RealTimeMetrics = {
  candy_detection_rate: 0,
  hand_tracking_accuracy: 0,
  task_completion_rate: 0,
  system_efficiency: 0,
  network_latency: 0,
  error_rate: 0
};

const defaultNeighborsData: NeighborsData = {
  stations: [],
  topology: {
    positions: {},
    connections: [],
    graph: { nodes: [], edges: [] }
  },
  ble_connections: [],
  master_station: undefined,
  last_update: 0
};

const defaultConnectionStatus: ConnectionStatus = {
  mqtt_connected: false,
  last_data_received: 0,
  topics_subscribed: [],
  message_count: 0,
  error_count: 0
};

const ManagementInterfaceContext = createContext<ManagementContextType | null>(null);

export const useManagementInterface = () => {
  const context = useContext(ManagementInterfaceContext);
  if (!context) {
    throw new Error('useManagementInterface must be used within ManagementInterfaceProvider');
  }
  return context;
};

export const ManagementInterfaceProvider = ({ children }: { children: ReactNode }) => {
  const [mqttService] = useState(() => new MqttService(mqttConfig));
  const [dataState, setDataState] = useState<DataState>({
    sensorData: defaultSensorData,
    tasks: [],
    warnings: [],
    systemStatus: 'Operational',
    isConnected: false,
    candyDetection: null,
    handPosition: null,
    gridActivity: defaultGridActivity,
    taskProgress: defaultTaskProgress,
    realTimeMetrics: defaultRealTimeMetrics,
    neighborsData: defaultNeighborsData,
    connectionStatus: defaultConnectionStatus,
    lastUpdate: 0
  });

  // Enhanced update functions with better state management
  const updateSensorData = useCallback((sensorData: SensorData) => {
    setDataState(prev => ({
      ...prev,
      sensorData,
      systemStatus: sensorData.status,
      lastUpdate: Date.now()
    }));
  }, []);

  const updateTasks = useCallback((tasks: Task[]) => {
    setDataState(prev => ({
      ...prev,
      tasks,
      lastUpdate: Date.now()
    }));
  }, []);

  const updateWarnings = useCallback((warnings: Warning[]) => {
    setDataState(prev => ({
      ...prev,
      warnings,
      lastUpdate: Date.now()
    }));
  }, []);

  const updateSystemStatus = useCallback((systemStatus: SystemStatus) => {
    setDataState(prev => ({
      ...prev,
      systemStatus,
      lastUpdate: Date.now()
    }));
  }, []);

  const updateConnectionStatus = useCallback((isConnected: boolean) => {
    setDataState(prev => ({
      ...prev,
      isConnected,
      connectionStatus: {
        ...prev.connectionStatus,
        mqtt_connected: isConnected,
        last_data_received: isConnected ? Date.now() : prev.connectionStatus.last_data_received
      },
      lastUpdate: Date.now()
    }));
  }, []);

  // New update functions for real-time data
  const updateCandyDetection = useCallback((candyDetection: CandyDetection) => {
    setDataState(prev => ({
      ...prev,
      candyDetection,
      realTimeMetrics: {
        ...prev.realTimeMetrics,
        candy_detection_rate: calculateDetectionRate(candyDetection)
      },
      lastUpdate: Date.now()
    }));
  }, []);

  const updateHandPosition = useCallback((handPosition: HandPosition) => {
    setDataState(prev => ({
      ...prev,
      handPosition,
      realTimeMetrics: {
        ...prev.realTimeMetrics,
        hand_tracking_accuracy: calculateHandAccuracy(handPosition)
      },
      lastUpdate: Date.now()
    }));
  }, []);

  const updateGridActivity = useCallback((gridActivity: GridActivity) => {
    setDataState(prev => ({
      ...prev,
      gridActivity,
      lastUpdate: Date.now()
    }));
  }, []);

  const updateTaskProgress = useCallback((taskProgress: TaskProgress) => {
    setDataState(prev => ({
      ...prev,
      taskProgress,
      realTimeMetrics: {
        ...prev.realTimeMetrics,
        task_completion_rate: calculateTaskCompletionRate(taskProgress),
        system_efficiency: calculateSystemEfficiency(taskProgress, prev.realTimeMetrics)
      },
      lastUpdate: Date.now()
    }));
  }, []);

  const updateNeighborsData = useCallback((neighborsData: NeighborsData) => {
    setDataState(prev => ({
      ...prev,
      neighborsData,
      lastUpdate: Date.now()
    }));
  }, []);

  // Utility functions for calculating metrics
  const calculateDetectionRate = (detection: CandyDetection): number => {
    // Calculate detections per minute based on recent activity
    return detection.total_candies > 0 ? Math.min(100, detection.total_candies * 5) : 0;
  };

  const calculateHandAccuracy = (hand: HandPosition): number => {
    const leftAccuracy = hand.left_hand?.confidence || 0;
    const rightAccuracy = hand.right_hand?.confidence || 0;
    return Math.max(leftAccuracy, rightAccuracy) * 100;
  };

  const calculateTaskCompletionRate = (progress: TaskProgress): number => {
    const completedInLastHour = progress.completed_tasks.filter(
      task => Date.now() - task.timestamp < 3600000
    ).length;
    return completedInLastHour;
  };

  const calculateSystemEfficiency = (progress: TaskProgress, metrics: RealTimeMetrics): number => {
    const activeTasksRatio = progress.current_tasks.length > 0 ?
      progress.current_tasks.filter(t => t.status === 'in-progress').length / progress.current_tasks.length : 0;
    const completionRate = metrics.task_completion_rate;
    const errorRate = metrics.error_rate;

    return Math.max(0, Math.min(100, (activeTasksRatio * 40 + completionRate * 5 + (100 - errorRate) * 0.55)));
  };

  // Enhanced management functions
  const clearWarnings = useCallback(() => {
    setDataState(prev => ({
      ...prev,
      warnings: [],
      lastUpdate: Date.now()
    }));
  }, []);

  const acknowledgeWarning = useCallback((warningId: number) => {
    setDataState(prev => ({
      ...prev,
      warnings: prev.warnings.filter(w => w.id !== warningId),
      lastUpdate: Date.now()
    }));
  }, []);

  const exportWarnings = useCallback(() => {
    const data = {
      warnings: dataState.warnings,
      exportDate: new Date().toISOString(),
      systemStatus: dataState.systemStatus,
      totalTasks: dataState.tasks.length,
      activeTasks: dataState.tasks.filter(t => t.status === 'in-progress').length
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workstation-alerts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dataState]);

  const getConnectionHealth = useCallback((): 'healthy' | 'warning' | 'critical' => {
    if (!dataState.isConnected) return 'critical';

    const timeSinceLastUpdate = Date.now() - dataState.lastUpdate;
    const errorRate = dataState.connectionStatus.error_count / Math.max(1, dataState.connectionStatus.message_count);

    if (timeSinceLastUpdate > 60000 || errorRate > 0.1) return 'warning';
    if (timeSinceLastUpdate > 300000 || errorRate > 0.3) return 'critical';

    return 'healthy';
  }, [dataState]);

  const connectToMqtt = useCallback(async () => {
    try {
      console.log('Connecting to MQTT broker for Workstation Brain data...');

      await mqttService.connect({
        onSensorData: updateSensorData,
        onTasks: updateTasks,
        onWarnings: updateWarnings,
        onSystemStatus: updateSystemStatus,
        onConnectionChange: updateConnectionStatus,
        onCandyDetection: updateCandyDetection,
        onHandPosition: updateHandPosition,
        onGridActivity: updateGridActivity,
        onTaskProgress: updateTaskProgress,
        onNeighborsData: updateNeighborsData
      });

      console.log('Successfully connected to Workstation Brain MQTT broker');

      // Start simulation only if no real data is received
      setTimeout(() => {
        if (dataState.tasks.length === 0 && dataState.lastUpdate < Date.now() - 30000) {
          console.log('No real data received, starting simulation...');
          mqttService.simulateSensorUpdates();
        }
      }, 30000);

    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      setDataState(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: {
          ...prev.connectionStatus,
          mqtt_connected: false,
          error_count: prev.connectionStatus.error_count + 1
        }
      }));

      // Start simulation as fallback
      setTimeout(() => {
        console.log('Starting fallback simulation...');
        mqttService.simulateSensorUpdates();
      }, 5000);
    }
  }, [
    mqttService,
    updateSensorData,
    updateTasks,
    updateWarnings,
    updateSystemStatus,
    updateConnectionStatus,
    updateCandyDetection,
    updateHandPosition,
    updateGridActivity,
    updateTaskProgress,
    updateNeighborsData,
    dataState.tasks.length,
    dataState.lastUpdate
  ]);

  const reconnect = useCallback(async () => {
    console.log('Attempting to reconnect to Workstation Brain...');
    mqttService.disconnect();
    await connectToMqtt();
  }, [connectToMqtt, mqttService]);

  const retryConnection = useCallback(() => {
    reconnect().catch(error => {
      console.error('Retry connection failed:', error);
    });
  }, [reconnect]);

  // Connection health monitoring
  useEffect(() => {
    const healthCheck = setInterval(() => {
      const health = getConnectionHealth();
      if (health === 'critical' && dataState.isConnected) {
        console.warn('Connection health is critical, attempting reconnection...');
        retryConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheck);
  }, [getConnectionHealth, dataState.isConnected, retryConnection]);

  // Initialize connection
  useEffect(() => {
    connectToMqtt();
    return () => {
      mqttService.disconnect();
    };
  }, [connectToMqtt, mqttService]);

  const contextValue: ManagementContextType = {
    ...dataState,
    mqttService,
    reconnect,
    clearWarnings,
    acknowledgeWarning,
    exportWarnings,
    retryConnection,
    getConnectionHealth
  };

  return (
    <ManagementInterfaceContext.Provider value={contextValue}>
      {children}
    </ManagementInterfaceContext.Provider>
  );
};
