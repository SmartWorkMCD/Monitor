import React from 'react';
import { Eye, Hand, Grid3X3, Activity, Wifi, MapPin } from 'lucide-react';
import type {
  CandyDetection,
  HandPosition,
  GridActivity,
  RealTimeMetrics,
  NeighborsData
} from '../types';

interface RealTimeVisualizationsProps {
  candyDetection: CandyDetection | null;
  handPosition: HandPosition | null;
  gridActivity: GridActivity;
  realTimeMetrics: RealTimeMetrics;
  neighborsData: NeighborsData;
}

const RealTimeVisualizations: React.FC<RealTimeVisualizationsProps> = ({
  candyDetection,
  handPosition,
  gridActivity,
  realTimeMetrics,
  neighborsData
}) => {
  const renderGrid = () => {
    const cells = [];

    for (let row = 0; row < gridActivity.rows; row++) {
      for (let col = 0; col < gridActivity.cols; col++) {
        const isActive = gridActivity.active_cells.some(
          cell => cell.row === row && cell.col === col
        );
        const isConfirmation = gridActivity.confirmation_cell.row === row &&
                              gridActivity.confirmation_cell.col === col;
        const isValidationArea = row >= Math.floor(gridActivity.rows * 0.3) &&
                               row <= Math.floor(gridActivity.rows * 0.7) &&
                               col >= Math.floor(gridActivity.cols * 0.3) &&
                               col <= Math.floor(gridActivity.cols * 0.7);

        let cellClass = 'w-8 h-8 border border-gray-300 flex items-center justify-center text-xs';

        if (isConfirmation) {
          cellClass += ' bg-blue-200 border-blue-400';
        } else if (isActive) {
          cellClass += ' bg-green-200 border-green-400';
        } else if (isValidationArea) {
          cellClass += ' bg-yellow-50 border-yellow-200';
        } else {
          cellClass += ' bg-gray-50';
        }

        cells.push(
          <div key={`${row}-${col}`} className={cellClass}>
            {isActive && '👋'}
            {isConfirmation && '✓'}
          </div>
        );
      }
    }

    return (
      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: `repeat(${gridActivity.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridActivity.rows}, 1fr)`
        }}
      >
        {cells}
      </div>
    );
  };

  const renderCandyDetection = () => {
    if (!candyDetection || candyDetection.detections.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No candies detected
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total: {candyDetection.total_candies}</span>
          <span className={candyDetection.in_validation_area ? 'text-green-600' : 'text-orange-600'}>
            {candyDetection.in_validation_area ? '✓ In Area' : '⚠ Outside Area'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(candyDetection.colors_detected).map(([color, count]) => (
            <div key={color} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color.toLowerCase() }}
              />
              <span className="text-xs">{color}: {count}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          Detections: {candyDetection.detections.map(d =>
            `${d.class} (${Math.round(d.score * 100)}%)`
          ).join(', ')}
        </div>
      </div>
    );
  };

  const renderHandPosition = () => {
    if (!handPosition) {
      return (
        <div className="text-center text-gray-500 py-4">
          No hand detected
        </div>
      );
    }

    const activeHand = handPosition.right_hand || handPosition.left_hand;
    if (!activeHand) {
      return (
        <div className="text-center text-gray-500 py-4">
          Hand position unavailable
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>X: {(activeHand.x * 100).toFixed(1)}%</div>
          <div>Y: {(activeHand.y * 100).toFixed(1)}%</div>
        </div>

        {handPosition.grid_cell && (
          <div className="text-sm">
            Grid Cell: ({handPosition.grid_cell.row}, {handPosition.grid_cell.col})
          </div>
        )}

        <div className="text-xs">
          <span className={handPosition.in_confirmation_area ? 'text-green-600' : 'text-gray-600'}>
            {handPosition.in_confirmation_area ? '✓ In Confirmation Area' : 'Tracking...'}
          </span>
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    const metrics = [
      {
        label: 'Candy Detection',
        value: `${realTimeMetrics.candy_detection_rate.toFixed(1)}/min`,
        color: 'text-purple-600'
      },
      {
        label: 'Hand Accuracy',
        value: `${realTimeMetrics.hand_tracking_accuracy.toFixed(0)}%`,
        color: 'text-blue-600'
      },
      {
        label: 'Task Rate',
        value: `${realTimeMetrics.task_completion_rate.toFixed(1)}/hr`,
        color: 'text-green-600'
      },
      {
        label: 'Efficiency',
        value: `${realTimeMetrics.system_efficiency.toFixed(0)}%`,
        color: 'text-orange-600'
      },
      {
        label: 'Latency',
        value: `${realTimeMetrics.network_latency.toFixed(0)}ms`,
        color: 'text-red-600'
      },
      {
        label: 'Error Rate',
        value: `${realTimeMetrics.error_rate.toFixed(1)}%`,
        color: realTimeMetrics.error_rate > 5 ? 'text-red-600' : 'text-gray-600'
      }
    ];

    return (
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className={`font-bold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-gray-500">{metric.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderNetworkTopology = () => {
    if (neighborsData.stations.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No network data
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Stations: {neighborsData.stations.length}</span>
          <span>Master: {neighborsData.master_station || 'None'}</span>
        </div>

        <div className="space-y-1">
          {neighborsData.stations.slice(0, 4).map((station) => (
            <div key={station.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  station.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span>{station.id}</span>
                {station.is_master && <span className="text-yellow-600">👑</span>}
              </div>
              <span className="text-gray-500">{station.version}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          BLE Connections: {neighborsData.ble_connections.length}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Grid Activity */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <Grid3X3 size={16} className="text-blue-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Grid Activity</h3>
        </div>
        {renderGrid()}
        <div className="mt-2 text-xs text-gray-500">
          Validation area highlighted in yellow
        </div>
      </div>

      {/* Candy Detection */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <Eye size={16} className="text-purple-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Candy Detection</h3>
        </div>
        {renderCandyDetection()}
      </div>

      {/* Hand Tracking */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <Hand size={16} className="text-green-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Hand Tracking</h3>
        </div>
        {renderHandPosition()}
      </div>

      {/* Real-time Metrics */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <Activity size={16} className="text-red-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Live Metrics</h3>
        </div>
        {renderMetrics()}
      </div>

      {/* Network Topology */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <Wifi size={16} className="text-indigo-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Network</h3>
        </div>
        {renderNetworkTopology()}
      </div>

      {/* Validation Area Info */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-3">
          <MapPin size={16} className="text-yellow-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Validation Area</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div>Size: {gridActivity.validation_area.percentage}%</div>
          <div>X: {(gridActivity.validation_area.x_min * 100).toFixed(0)}% - {(gridActivity.validation_area.x_max * 100).toFixed(0)}%</div>
          <div>Y: {(gridActivity.validation_area.y_min * 100).toFixed(0)}% - {(gridActivity.validation_area.y_max * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-500">
            Candies must be detected within this area for task validation
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeVisualizations;
