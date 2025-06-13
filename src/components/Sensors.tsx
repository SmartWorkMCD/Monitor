// src/components/Sensors.tsx
import { useEffect, useState } from "react";
import {
	ArrowUp,
	ArrowDown,
	Thermometer,
	Droplets,
	Zap,
	Gauge,
	Activity,
	Clock,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import dayjs from "dayjs";
import type { SensorData } from "../types";

interface SensorsProps {
	sensorData: SensorData;
}

const getChangeIndicator = (change: number) => {
	if (change > 0) {
		return {
			icon: <ArrowUp size={12} />,
			className: "text-red-600",
			direction: "increased",
		};
	}

	if (change < 0) {
		return {
			icon: <ArrowDown size={12} />,
			className: "text-green-600",
			direction: "decreased",
		};
	}

	return {
		icon: null,
		className: "text-gray-600",
		direction: "stable",
	};
};

const Sensors = ({ sensorData }: SensorsProps) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
	const [updateCount, setUpdateCount] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// Track when sensor data changes
	useEffect(() => {
		setLastUpdate(new Date());
		setUpdateCount(prev => prev + 1);
	}, [sensorData]);

	const temperatureChange = getChangeIndicator(sensorData.temperatureChange);
	const humidityChange = getChangeIndicator(sensorData.humidityChange);
	const powerChange = getChangeIndicator(sensorData.powerUsageChange);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'operational':
				return 'text-green-600';
			case 'warning':
				return 'text-yellow-600';
			case 'critical':
				return 'text-red-600';
			default:
				return 'text-gray-600';
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full overflow-y-auto">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-bold text-gray-700">Sensor Dashboard</h2>
				<div className="flex items-center gap-2">
					<Activity size={16} className="text-blue-500" />
					<span className="text-xs text-gray-500">
						{updateCount} updates
					</span>
				</div>
			</div>

			{/* Header with current time and status */}
			<div className="flex justify-between items-center mb-4">
				<div className="text-sm text-gray-500" data-testid="current-time">
					<span data-testid="current-date">{currentTime.toLocaleDateString()}</span>
					{" | "}
					<span data-testid="current-time-value">{currentTime.toLocaleTimeString()}</span>
				</div>
				<StatusBadge status={sensorData.status} />
			</div>

			{/* Last update indicator */}
			{lastUpdate && (
				<div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded">
					<Clock size={14} className="text-gray-400" />
					<span className="text-xs text-gray-500">
						Last update: {dayjs(lastUpdate).format('HH:mm:ss')}
					</span>
				</div>
			)}

			{/* Sensor metrics grid */}
			<div className="grid grid-cols-2 gap-4 mt-2">
				{/* Temperature metric */}
				<div className="bg-blue-50 p-3 rounded-lg" data-testid="temperature-metric">
					<div className="flex items-center mb-2">
						<Thermometer size={18} className="text-blue-600 mr-2" />
						<span className="text-sm font-medium text-gray-700">
							Temperature
						</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-2xl font-bold text-blue-700" data-testid="temperature-value">
							{sensorData.temperature.toFixed(1)}
						</span>
						<span className="ml-1 text-gray-500">°C</span>
					</div>
					<div
						className={`flex items-center mt-1 text-xs ${temperatureChange.className}`}
						data-testid="temperature-change"
					>
						{temperatureChange.icon}
						<span>
							{Math.abs(sensorData.temperatureChange).toFixed(1)}° from last hour
						</span>
					</div>
				</div>

				{/* Humidity metric */}
				<div className="bg-teal-50 p-3 rounded-lg" data-testid="humidity-metric">
					<div className="flex items-center mb-2">
						<Droplets size={18} className="text-teal-600 mr-2" />
						<span className="text-sm font-medium text-gray-700">Humidity</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-2xl font-bold text-teal-700" data-testid="humidity-value">
							{sensorData.humidity}
						</span>
						<span className="ml-1 text-gray-500">%</span>
					</div>
					<div
						className={`flex items-center mt-1 text-xs ${humidityChange.className}`}
						data-testid="humidity-change"
					>
						{humidityChange.icon}
						<span>{Math.abs(sensorData.humidityChange).toFixed(1)}% from last hour</span>
					</div>
				</div>

				{/* Pressure metric */}
				<div className="bg-purple-50 p-3 rounded-lg" data-testid="pressure-metric">
					<div className="flex items-center mb-2">
						<Gauge size={18} className="text-purple-600 mr-2" />
						<span className="text-sm font-medium text-gray-700">Pressure</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-2xl font-bold text-purple-700" data-testid="pressure-value">
							{sensorData.pressure}
						</span>
						<span className="ml-1 text-gray-500">mmHg</span>
					</div>
					<div className="flex items-center mt-1 text-xs text-gray-600" data-testid="pressure-change">
						<span>Stable</span>
					</div>
				</div>

				{/* Power usage metric */}
				<div className="bg-amber-50 p-3 rounded-lg" data-testid="power-metric">
					<div className="flex items-center mb-2">
						<Zap size={18} className="text-amber-600 mr-2" />
						<span className="text-sm font-medium text-gray-700">Power</span>
					</div>
					<div className="flex items-baseline">
						<span className="text-2xl font-bold text-amber-700" data-testid="power-value">
							{sensorData.powerUsage.toFixed(1)}
						</span>
						<span className="ml-1 text-gray-500">kW</span>
					</div>
					<div
						className={`flex items-center mt-1 text-xs ${powerChange.className}`}
						data-testid="power-change"
					>
						{powerChange.icon}
						<span>
							{Math.abs(sensorData.powerUsageChange).toFixed(1)}kW from yesterday
						</span>
					</div>
				</div>
			</div>

			{/* System status summary */}
			<div className="mt-4 p-3 bg-gray-50 rounded-lg">
				<div className="flex items-center gap-2 mb-2">
					<Activity size={16} className={getStatusColor(sensorData.status)} />
					<span className="text-sm font-medium text-gray-700">System Status</span>
				</div>
				<div className="text-sm text-gray-600">
					{sensorData.status === 'Operational' && (
						<span className="text-green-600">All systems functioning normally</span>
					)}
					{sensorData.status === 'Warning' && (
						<span className="text-yellow-600">Some systems require attention</span>
					)}
					{sensorData.status === 'Critical' && (
						<span className="text-red-600">Critical systems offline</span>
					)}
				</div>
			</div>

			{/* System notes section */}
			<div className="mt-4 text-sm text-gray-500" data-testid="system-notes">
				<div className="font-medium">System Notes:</div>
				<p data-testid="maintenance-info">
					Scheduled maintenance <span data-testid="maintenance-date">{dayjs().to(dayjs(sensorData.maintenanceDate))}</span>
				</p>
			</div>
		</div>
	);
};

export default Sensors;
