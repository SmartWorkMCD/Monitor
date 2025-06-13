import type React from 'react';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useManagementInterface } from '../context/ManagementInterfaceContext';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const { reconnect } = useManagementInterface();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md ${
        isConnected
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isConnected ? (
          <>
            <Wifi size={16} />
            <span className="text-sm font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm font-medium">Disconnected</span>
            <button
              onClick={reconnect}
              className="ml-2 p-1 hover:bg-red-200 rounded transition-colors"
              title="Reconnect"
            >
              <RotateCcw size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
