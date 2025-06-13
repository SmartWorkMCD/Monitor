
// src/utils/dataTransform.ts
import type { Task, Warning, SensorData, SystemStatusValue, SystemStatus } from '../types';
import type { AggregatorMetrics, MQTTMessage } from '../services/dataService';

/**
 * Transform MQTT message to Warning object
 */
export const mqttMessageToWarning = (message: MQTTMessage): Warning | null => {
  if (message.type === 'rule_evaluation' && !message.satisfied) {
    return {
      id: Date.now() + Math.random(),
      severity: 'high',
      message: `Rule violation: ${message.rule_id} - ${message.details || 'No details provided'}`,
      timestamp: message.timestamp
    };
  }

  if (message.type === 'system_status' && ['critical', 'error'].includes(message.status?.toLowerCase() || '')) {
    return {
      id: Date.now() + Math.random(),
      severity: 'high',
      message: message.message || `System status: ${message.status}`,
      timestamp: message.timestamp
    };
  }

  return null;
};

/**
 * Transform MQTT message to Task object
 */
export const mqttMessageToTask = (message: MQTTMessage): Task | null => {
  if (message.type === 'task_update' && message.task_id && message.subtask_id) {
    return {
      id: parseInt(message.task_id) || Date.now(),
      title: message.subtask_id,
      status: mapMQTTStatusToTaskStatus(message.status || 'pending'),
      deadline: Date.now() + 86400000 // Default 24 hours from now
    };
  }

  return null;
};

/**
 * Map MQTT status to Task status
 */
export const mapMQTTStatusToTaskStatus = (mqttStatus: string): Task['status'] => {
  const statusMap: Record<string, Task['status']> = {
    'started': 'in-progress',
    'in_progress': 'in-progress',
    'executing': 'in-progress',
    'waiting_confirmation': 'in-progress',
    'completed': 'completed',
    'failed': 'pending',
    'pending': 'pending'
  };

  return statusMap[mqttStatus.toLowerCase()] || 'pending';
};

/**
 * Generate synthetic sensor data from aggregator metrics
 */
export const generateSensorDataFromMetrics = (
  aggregatorMetrics: AggregatorMetrics,
  systemStatus: string = 'Operational'
): SensorData => {
  const defectRate = aggregatorMetrics.total_registos > 0
    ? aggregatorMetrics.total_defeitos / aggregatorMetrics.total_registos
    : 0;

  const baseTemp = 25 + (defectRate * 15); // Temperature increases with defect rate
  const baseHumidity = 45 + (aggregatorMetrics.taxa_sucesso / 2); // Humidity correlates with success
  const basePower = 3.5 + (aggregatorMetrics.tempo_medio_montagem / 20); // Power correlates with assembly time

  return {
    temperature: Math.round(baseTemp * 10) / 10,
    temperatureChange: (Math.random() - 0.5) * 2,
    humidity: Math.round(baseHumidity),
    humidityChange: (Math.random() - 0.5) * 5,
    pressure: 760 + Math.round((Math.random() - 0.5) * 10),
    powerUsage: Math.round(basePower * 10) / 10,
    powerUsageChange: (Math.random() - 0.5) * 0.5,
    status: mapStringToSystemStatus(systemStatus),
    maintenanceDate: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
  };
};

/**
 * Map string to system status
 */
export const mapStringToSystemStatus = (status: SystemStatusValue): SystemStatus => {
  const statusMap: Record<SystemStatusValue, SystemStatus> = {
    // 'operational': 'Operational',
    'idle': 'Operational',
    // 'ready': 'Operational',
    // 'warning': 'Warning',
    'cleaning': 'Warning',
    // 'waiting': 'Warning',
    // 'critical': 'Critical',
    'error': 'Critical',
    'active': 'Operational',
    'waiting_confirmation': 'Warning',
    // 'failed': 'Critical'
  };

  return statusMap[status] || 'Warning';
};

/**
 * Calculate task statistics
 */
export const calculateTaskStatistics = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const overdue = tasks.filter(t => t.deadline < Date.now() && t.status !== 'completed').length;

  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    overdueRate: total > 0 ? (overdue / total) * 100 : 0
  };
};

/**
 * Format time duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else {
    return `${Math.round(seconds / 3600)}h`;
  }
};

/**
 * Format number with appropriate units
 */
export const formatMetric = (value: number, unit: string, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}${unit}`;
};
