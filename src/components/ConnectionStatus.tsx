// src/components/ConnectionStatus.tsx
import { Wifi, WifiOff, Database, AlertTriangle } from "lucide-react";

interface ConnectionStatusProps {
	isConnected: boolean;
	connectionError: string | null;
	useMockData: boolean;
}

const ConnectionStatus = ({ isConnected, connectionError, useMockData }: ConnectionStatusProps) => {
	if (isConnected) {
		return (
			<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md flex items-center gap-2">
				<Wifi size={16} />
				<span className="text-sm font-medium">Connected to Production System</span>
				<div className="ml-auto flex items-center gap-1">
					<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
					<span className="text-xs">Live Data</span>
				</div>
			</div>
		);
	}

	if (useMockData) {
		return (
			<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-md flex items-center gap-2">
				<Database size={16} />
				<span className="text-sm font-medium">Demo Mode - Using Sample Data</span>
				<div className="ml-auto flex items-center gap-1">
					<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
					<span className="text-xs">Mock Data</span>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md flex items-center gap-2">
			<WifiOff size={16} />
			<div className="flex items-center gap-2">
				<AlertTriangle size={16} />
				<span className="text-sm font-medium">
					Connection Failed: {connectionError || 'Unable to connect to production system'}
				</span>
			</div>
			<div className="ml-auto flex items-center gap-1">
				<div className="w-2 h-2 bg-red-500 rounded-full"></div>
				<span className="text-xs">Offline</span>
			</div>
		</div>
	);
};

export default ConnectionStatus;
