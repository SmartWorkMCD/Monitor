import { useState } from "react";
import { Monitor, Activity, Network, BarChart3 } from "lucide-react";
import Tasks from "./Tasks";
import Warnings from "./Warnings";
import Sensors from "./Sensors";
import ConnectionStatus from "./ConnectionStatus";
import RealTimeVisualizations from "./RealTimeVisualizations";
import { useManagementInterface } from "../context/ManagementInterfaceContext";

const Dashboard = () => {
  const {
    sensorData,
    tasks,
    warnings,
    isConnected,
    candyDetection,
    handPosition,
    gridActivity,
    realTimeMetrics,
    neighborsData,
    connectionStatus
  } = useManagementInterface();

  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'network' | 'analytics'>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 lg:grid-rows-3 gap-4 h-full">
            <div className="lg:col-span-2 lg:row-span-3" data-testid="tasks-section">
              <Tasks tasks={tasks} />
            </div>
            <div className="lg:row-span-1" data-testid="sensors-section">
              <Sensors sensorData={sensorData} />
            </div>
            <div className="lg:row-span-2" data-testid="warnings-section">
              <Warnings warnings={warnings} />
            </div>
          </div>
        );

      case 'realtime':
        return (
          <div className="h-full overflow-y-auto">
            <RealTimeVisualizations
              candyDetection={candyDetection}
              handPosition={handPosition}
              gridActivity={gridActivity}
              realTimeMetrics={realTimeMetrics}
              neighborsData={neighborsData}
            />
          </div>
        );

      case 'network':
        return (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 lg:grid-rows-3 gap-4 h-full"
            data-testid="dashboard-grid"
          >
            {/* Network Topology */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center">
                <Network size={20} className="mr-2" />
                Network Topology
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600">Active Stations</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {neighborsData.stations.length}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">BLE Connections</div>
                    <div className="text-2xl font-bold text-green-600">
                      {neighborsData.ble_connections.length}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-600 mb-2">Master Station</div>
                  <div className="text-lg">
                    {neighborsData.master_station ? (
                      <span className="text-yellow-600 font-bold">
                        👑 {neighborsData.master_station}
                      </span>
                    ) : (
                      <span className="text-gray-500">No master selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-600 mb-2">Station Status</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {neighborsData.stations.map((station) => (
                      <div key={station.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            station.status === 'online' ? 'bg-green-400' :
                            station.status === 'offline' ? 'bg-red-400' :
                            station.status === 'updating' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium">{station.id}</span>
                          {station.is_master && <span className="text-yellow-600">👑</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          v{station.version} | {station.neighbors.length} neighbors
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Details */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-700">Connection Details</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600">MQTT Status</div>
                    <div className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Messages</div>
                    <div className="text-lg font-bold text-blue-600">
                      {connectionStatus.message_count}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-600 mb-2">Subscribed Topics</div>
                  <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {connectionStatus.topics_subscribed.length > 0 ? (
                      connectionStatus.topics_subscribed.map((topic, index) => (
                        <div key={index} className="bg-gray-100 p-1 rounded font-mono">
                          {topic}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No topics subscribed</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600">Last Data</div>
                    <div className="text-sm">
                      {connectionStatus.last_data_received > 0 ? (
                        new Date(connectionStatus.last_data_received).toLocaleTimeString()
                      ) : (
                        'No data received'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Errors</div>
                    <div className={`text-lg font-bold ${
                      connectionStatus.error_count > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {connectionStatus.error_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center">
                <BarChart3 size={20} className="mr-2" />
                Performance Analytics
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {realTimeMetrics.candy_detection_rate.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Detections/min</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {realTimeMetrics.hand_tracking_accuracy.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Hand Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {realTimeMetrics.task_completion_rate.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Tasks/hour</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {realTimeMetrics.system_efficiency.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Network Latency</span>
                    <span className="font-bold">{realTimeMetrics.network_latency.toFixed(0)}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        realTimeMetrics.network_latency < 50 ? 'bg-green-500' :
                        realTimeMetrics.network_latency < 100 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, realTimeMetrics.network_latency)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-bold">{realTimeMetrics.error_rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        realTimeMetrics.error_rate < 1 ? 'bg-green-500' :
                        realTimeMetrics.error_rate < 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, realTimeMetrics.error_rate * 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-700">System Health</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Status</span>
                    <span className={`font-bold ${
                      sensorData.status === 'Operational' ? 'text-green-600' :
                      sensorData.status === 'Warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {sensorData.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Tasks</span>
                    <span className="font-bold">{tasks.filter(t => t.status === 'in-progress').length}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Tasks</span>
                    <span className="font-bold">{tasks.filter(t => t.status === 'pending').length}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Tasks</span>
                    <span className="font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600 mb-2">Recent Activity</div>
                  <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                    {candyDetection && (
                      <div className="flex justify-between">
                        <span>🍬 Candy Detection</span>
                        <span>{new Date(candyDetection.timestamp).toLocaleTimeString()}</span>
                      </div>
                    )}
                    {handPosition && (
                      <div className="flex justify-between">
                        <span>✋ Hand Tracking</span>
                        <span>{new Date(handPosition.timestamp).toLocaleTimeString()}</span>
                      </div>
                    )}
                    {warnings.length > 0 && (
                      <div className="flex justify-between">
                        <span>⚠️ Latest Warning</span>
                        <span>{new Date(warnings[0].timestamp).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4" data-testid="dashboard-container">
      <ConnectionStatus isConnected={isConnected} />

      {/* Header with Navigation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Monitor size={24} className="text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Workstation Brain Monitor</h1>
          </div>
          <div className="text-sm text-gray-600">
            Real-time data from Smart Work MCD
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Monitor },
            { id: 'realtime', label: 'Real-time', icon: Activity },
            { id: 'network', label: 'Network', icon: Network },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="h-full overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
