import type React from 'react';
import {
  Wifi,
  WifiOff,
  RotateCcw,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Hand,
  Zap,
  Server,
  Clock,
  TrendingUp,
  AlertTriangle,
  Settings,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useManagementInterface } from '../context/ManagementInterfaceContext';

interface ConnectionStatusProps {
  isConnected: boolean;
}

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const { mqttService, connectionStatus, realTimeMetrics, getConnectionHealth } = useManagementInterface();

  if (!isOpen) return null;

  const connectionStats = mqttService.getConnectionStats();
  const dataStats = mqttService.getDataStats();
  const health = getConnectionHealth();

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle size={16} className="text-green-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'critical': return <AlertCircle size={16} className="text-red-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Server size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Connection Diagnostics</h2>
              <p className="text-sm text-gray-600">Real-time system health and performance metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Health */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                {getHealthIcon(health)}
                <h3 className="text-lg font-semibold text-gray-800">Connection Health</h3>
                <span className={`text-sm font-medium ${getHealthColor(health)}`}>
                  {health.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MQTT Status:</span>
                  <span className={`font-medium ${connectionStats.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {connectionStats.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Client ID:</span>
                  <span className="font-mono text-xs text-gray-700">
                    {connectionStats.clientId || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subscribed Topics:</span>
                  <span className="font-medium text-blue-600">
                    {connectionStats.subscribedTopics}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reconnect Attempts:</span>
                  <span className={`font-medium ${connectionStats.reconnectAttempts > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {connectionStats.reconnectAttempts}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp size={18} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Efficiency:</span>
                  <span className="font-medium text-blue-600">
                    {realTimeMetrics.system_efficiency.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Network Latency:</span>
                  <span className={`font-medium ${realTimeMetrics.network_latency > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {realTimeMetrics.network_latency.toFixed(0)}ms
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Detection Rate:</span>
                  <span className="font-medium text-purple-600">
                    {realTimeMetrics.candy_detection_rate.toFixed(1)}/min
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hand Accuracy:</span>
                  <span className="font-medium text-blue-600">
                    {realTimeMetrics.hand_tracking_accuracy.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Message Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Activity size={18} className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">Message Statistics</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Messages:</span>
                  <span className="font-medium text-indigo-600">
                    {connectionStats.messageCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Count:</span>
                  <span className={`font-medium ${connectionStats.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {connectionStats.errorCount}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate:</span>
                  <span className={`font-medium ${realTimeMetrics.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {realTimeMetrics.error_rate.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Update:</span>
                  <span className="font-medium text-gray-700">
                    {connectionStatus.last_data_received > 0 ?
                      new Date(connectionStatus.last_data_received).toLocaleTimeString() :
                      'Never'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Data Flow Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Zap size={18} className="text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-800">Data Flow Status</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Tasks:</span>
                  <span className="font-medium text-blue-600">
                    {dataStats.tasksCount}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Warnings:</span>
                  <span className={`font-medium ${dataStats.warningsCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {dataStats.warningsCount}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Tasks:</span>
                  <span className="font-medium text-green-600">
                    {dataStats.completedTasks}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Connected Stations:</span>
                  <span className="font-medium text-purple-600">
                    {dataStats.connectedStations}
                  </span>
                </div>
              </div>
            </div>

            {/* Topic Status */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Server size={18} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Subscribed Topics</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {connectionStatus.topics_subscribed.map((topic, index) => (
                  <div key={index} className="bg-white rounded px-3 py-2 border">
                    <div className="font-mono text-xs text-gray-700 truncate" title={topic}>
                      {topic}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Data Status */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Real-time Data Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Eye size={24} className="mx-auto text-purple-600 mb-2" />
                  <div className="text-sm font-medium text-gray-700">Candy Detection</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataStats.lastCandyDetection ?
                      new Date(dataStats.lastCandyDetection).toLocaleTimeString() :
                      'No data'
                    }
                  </div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <Hand size={24} className="mx-auto text-blue-600 mb-2" />
                  <div className="text-sm font-medium text-gray-700">Hand Tracking</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataStats.lastHandPosition ?
                      new Date(dataStats.lastHandPosition).toLocaleTimeString() :
                      'No data'
                    }
                  </div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <Activity size={24} className="mx-auto text-green-600 mb-2" />
                  <div className="text-sm font-medium text-gray-700">Grid Activity</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataStats.activeCells} active cells
                  </div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                  <div className="text-sm font-medium text-gray-700">Task Progress</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataStats.completedTasks} completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            System Health: <span className={`font-medium ${getHealthColor(health)}`}>{health}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const {
    systemStatus,
    tasks,
    connectionStatus,
    candyDetection,
    handPosition,
    realTimeMetrics,
    getConnectionHealth,
    retryConnection
  } = useManagementInterface();

  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const connectionHealth = getConnectionHealth();

  const getMainStatusInfo = () => {
    if (!isConnected) {
      return {
        text: 'Disconnected from Workstation Brain',
        icon: <WifiOff size={16} />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    }

    const healthColor = connectionHealth === 'warning' ? 'yellow' : (connectionHealth === 'critical' ? 'red' : 'green');

    switch (systemStatus) {
      case 'Critical':
        return {
          text: 'Workstation Critical',
          icon: <AlertCircle size={16} className="animate-pulse" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'Warning':
        return {
          text: 'Workstation Warning',
          icon: <Activity size={16} className="animate-pulse" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          text: `Connected - ${tasks.length} tasks active`,
          icon: <Wifi size={16} />,
          bgColor: `bg-${healthColor}-100`,
          textColor: `text-${healthColor}-800`,
          borderColor: `border-${healthColor}-200`
        };
    }
  };

  const getDataFlowStatus = () => {
    const now = Date.now();
    const timeSinceLastData = connectionStatus.last_data_received > 0 ?
      now - connectionStatus.last_data_received : Number.POSITIVE_INFINITY;

    const dataIndicators = [
      {
        label: 'Candy Detection',
        active: candyDetection && (now - candyDetection.timestamp) < 30000,
        icon: <Eye size={12} />,
        lastData: candyDetection?.timestamp,
        color: 'text-purple-600',
        value: candyDetection?.total_candies || 0
      },
      {
        label: 'Hand Tracking',
        active: handPosition && (now - handPosition.timestamp) < 30000,
        icon: <Hand size={12} />,
        lastData: handPosition?.timestamp,
        color: 'text-blue-600',
        value: `${realTimeMetrics.hand_tracking_accuracy.toFixed(0)}%`
      },
      {
        label: 'Tasks',
        active: tasks.length > 0,
        icon: <CheckCircle size={12} />,
        lastData: tasks.length > 0 ? now : undefined,
        color: 'text-green-600',
        value: tasks.filter(t => t.status === 'in-progress').length
      },
      {
        label: 'Network',
        active: isConnected && timeSinceLastData < 30000,
        icon: <Wifi size={12} />,
        lastData: connectionStatus.last_data_received,
        color: 'text-indigo-600',
        value: `${realTimeMetrics.network_latency.toFixed(0)}ms`
      }
    ];

    return dataIndicators;
  };

  const statusInfo = getMainStatusInfo();
  const dataFlowStatus = getDataFlowStatus();

  return (
    <>
      <div className="fixed top-4 right-4 z-40">
        {/* Main Status */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md border ${
          statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} mb-2`}>
          {statusInfo.icon}
          <span className="text-sm font-medium">{statusInfo.text}</span>

          <div className="flex items-center space-x-1 ml-2">
            {!isConnected && (
              <button
                onClick={retryConnection}
                className="p-1 hover:bg-red-200 rounded transition-colors"
                title="Retry connection"
                type="button"
              >
                <RotateCcw size={14} />
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded transition-colors ${
                isConnected ? 'hover:bg-green-200' : 'hover:bg-red-200'
              }`}
              title={isExpanded ? "Collapse details" : "Expand details"}
              type="button"
            >
              <Activity size={14} />
            </button>

            <button
              onClick={() => setShowDiagnostics(true)}
              className={`p-1 rounded transition-colors ${
                isConnected ? 'hover:bg-green-200' : 'hover:bg-red-200'
              }`}
              title="Open diagnostics"
              type="button"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Expanded Data Flow Indicators */}
        {isConnected && isExpanded && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-gray-600">Data Streams</div>
              <div className={`text-xs font-medium ${
                connectionHealth === 'healthy' ? 'text-green-600' :
                connectionHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {connectionHealth.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {dataFlowStatus.map((indicator, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`${indicator.color} ${indicator.active ? 'opacity-100' : 'opacity-30'}`}>
                    {indicator.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium ${
                      indicator.active ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {indicator.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {indicator.value}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    indicator.active ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="border-t border-gray-100 mt-3 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span className="font-medium">{connectionStatus.message_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium text-blue-600">
                    {realTimeMetrics.system_efficiency.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Errors:</span>
                  <span className={`font-medium ${
                    connectionStatus.error_count > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {connectionStatus.error_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Topics:</span>
                  <span className="font-medium">{connectionStatus.topics_subscribed.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </>
  );
};

export default ConnectionStatus;
