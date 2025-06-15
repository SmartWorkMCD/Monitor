import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MqttService } from "../services/MqttService";
import { mqttConfig } from "../mqtt.config";
import type { SensorData, Task, Warning, SystemStatus } from "../types";

interface DataState {
  sensorData: SensorData;
  tasks: Task[];
  warnings: Warning[];
  systemStatus: SystemStatus;
  isConnected: boolean;
}

interface ManagementContextType extends DataState {
  mqttService: MqttService;
  reconnect: () => Promise<void>;
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
  maintenanceDate: Date.now() + 86400000 * 7 // 7 days from now
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
    isConnected: false
  });

  const updateSensorData = (sensorData: SensorData) => {
    setDataState(prev => ({
      ...prev,
      sensorData,
      systemStatus: sensorData.status
    }));
  };

  const updateTasks = (tasks: Task[]) => {
    setDataState(prev => ({ ...prev, tasks }));
  };

  const updateWarnings = (warnings: Warning[]) => {
    setDataState(prev => ({ ...prev, warnings }));
  };

  const updateSystemStatus = (systemStatus: SystemStatus) => {
    setDataState(prev => ({ ...prev, systemStatus }));
  };

  const updateConnectionStatus = (isConnected: boolean) => {
    setDataState(prev => ({ ...prev, isConnected }));
  };

  const connectToMqtt = async () => {
    try {
      console.log('Connecting to MQTT broker for Workstation Brain data...');

      await mqttService.connect({
        onSensorData: updateSensorData,
        onTasks: updateTasks,
        onWarnings: updateWarnings,
        onSystemStatus: updateSystemStatus,
        onConnectionChange: updateConnectionStatus
      });

      console.log('Successfully connected to Workstation Brain MQTT broker');

      // Only start simulation if no real data is received within 30 seconds
      setTimeout(() => {
        if (dataState.tasks.length === 0) {
          console.log('No real task data received, starting sensor simulation...');
          mqttService.simulateSensorUpdates();
        }
      }, 30000);

    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      setDataState(prev => ({ ...prev, isConnected: false }));

      // Start simulation as fallback if connection fails
      setTimeout(() => {
        console.log('Starting fallback sensor simulation...');
        mqttService.simulateSensorUpdates();
      }, 5000);
    }
  };

  const reconnect = async () => {
    console.log('Attempting to reconnect to Workstation Brain...');
    mqttService.disconnect();
    await connectToMqtt();
  };

  useEffect(() => {
    connectToMqtt();

    return () => {
      mqttService.disconnect();
    };
  }, []);

  const contextValue: ManagementContextType = {
    ...dataState,
    mqttService,
    reconnect
  };

  return (
    <ManagementInterfaceContext.Provider value={contextValue}>
      {children}
    </ManagementInterfaceContext.Provider>
  );
};
