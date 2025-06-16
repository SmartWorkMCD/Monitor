import { useEffect, useState } from "react";
import {
	ArrowUp,
	ArrowDown,
	Thermometer,
	Droplets,
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

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const temperatureChange = getChangeIndicator(sensorData.temperatureChange);
	const humidityChange = getChangeIndicator(sensorData.humidityChange);

	return (
		<div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full overflow-y-auto">
			<h2 className="text-lg font-bold mb-4 text-gray-700">Sensor Dashboard</h2>

			{/* Header with current time and status */}
			<div className="flex justify-between items-center mb-4">
				<div className="text-sm text-gray-500" data-testid="current-time">
					<span data-testid="current-date">{currentTime.toLocaleDateString()}</span>
					{" | "}
					<span data-testid="current-time-value">{currentTime.toLocaleTimeString()}</span>
				</div>
				<StatusBadge status={sensorData.status} />
			</div>

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
							{sensorData.temperature}
						</span>
						<span className="ml-1 text-gray-500">°C</span>
					</div>
					<div
						className={`flex items-center mt-1 text-xs ${temperatureChange.className}`}
						data-testid="temperature-change"
					>
						{temperatureChange.icon}
						<span>
							{Math.abs(sensorData.temperatureChange)}° from last hour
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
						<span>{Math.abs(sensorData.humidityChange)}% from last hour</span>
					</div>
				</div>


			</div>

			{/* System notes section */}
			<div className="mt-4 text-sm text-gray-500" data-testid="system-notes">
				<div className="font-medium">System Notes:</div>
				<p data-testid="maintenance-info">
					All systems functioning within normal parameters. Scheduled
					maintenance <span data-testid="maintenance-date">{dayjs().to(dayjs(sensorData.maintenanceDate))}</span>
				</p>
			</div>
		</div>
	);
};

export default Sensors;
