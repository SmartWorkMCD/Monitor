import type React from 'react';
import { Wifi, WifiOff, RotateCcw, Activity } from 'lucide-react';
import { useManagementInterface } from '../context/ManagementInterfaceContext';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const { reconnect, systemStatus, tasks } = useManagementInterface();

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        text: 'Disconnected from Workstation Brain',
        icon: <WifiOff size={16} />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    }

    // Show system status when connected
    switch (systemStatus) {
      case 'Critical':
        return {
          text: 'Workstation Critical',
          icon: <Activity size={16} className="animate-pulse" />,
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
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md border ${
        statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}>
        {statusInfo.icon}
        <span className="text-sm font-medium">{statusInfo.text}</span>

        {!isConnected && (
          <button
            onClick={reconnect}
            className="ml-2 p-1 hover:bg-red-200 rounded transition-colors"
            title="Reconnect to Workstation Brain"
            type="button"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* Additional status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
          Status: {systemStatus} | Tasks: {tasks.length}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
