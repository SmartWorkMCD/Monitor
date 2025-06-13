// src/components/Dashboard.tsx
import { useEffect, useState } from "react";
import Tasks from "./Tasks";
import Warnings from "./Warnings";
import Sensors from "./Sensors";
import ConnectionStatus from "./ConnectionStatus";
import { useMQTT } from "../hooks/useMQTT";
import type { Task, Warning, SensorData } from "../types";

// Import mock data as fallback
import sensorDataMock from "../mocks/sensorData.json";
import warningsMock from "../mocks/warnings.json";
import tasksMock from "../mocks/tasks.json";

const Dashboard = () => {
	// MQTT Configuration - in production, these should come from environment variables
	const mqttConfig = {
		broker: import.meta.env.VITE_MQTT_BROKER || "localhost",
		port: Number.parseInt(import.meta.env.VITE_MQTT_PORT || "1883"),
		username: import.meta.env.VITE_MQTT_USERNAME,
		password: import.meta.env.VITE_MQTT_PASSWORD,
	};

	const {
		sensorData,
		tasks,
		warnings,
		isConnected,
		connectionError
	} = useMQTT(mqttConfig);

	// Fallback to mock data if no real data is available
	const [useMockData, setUseMockData] = useState(false);

	useEffect(() => {
		// Use mock data if MQTT is not connected after 5 seconds
		const timer = setTimeout(() => {
			if (!isConnected && !sensorData && tasks.length === 0) {
				console.log('[Dashboard] Using mock data due to no MQTT connection');
				setUseMockData(true);
			}
		}, 5000);

		return () => clearTimeout(timer);
	}, [isConnected, sensorData, tasks]);

	// Use real data if available, otherwise fall back to mock data
	const displaySensorData: SensorData = sensorData || (useMockData ? sensorDataMock as SensorData : {
		temperature: 0,
		temperatureChange: 0,
		humidity: 0,
		humidityChange: 0,
		pressure: 0,
		powerUsage: 0,
		powerUsageChange: 0,
		status: 'Critical',
		maintenanceDate: Date.now() + 86400000 * 7,
	});

	const displayTasks: Task[] = tasks.length > 0 ? tasks : (useMockData ? tasksMock as Task[] : []);
	const displayWarnings: Warning[] = warnings.length > 0 ? warnings : (useMockData ? warningsMock as Warning[] : []);

	return (
		<div className="h-screen bg-gray-100 p-4" data-testid="dashboard-container">
			{/* Connection Status Bar */}
			<ConnectionStatus
				isConnected={isConnected}
				connectionError={connectionError}
				useMockData={useMockData}
			/>

			{/* Main Dashboard Grid */}
			<div
				className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 lg:grid-rows-3 gap-4 h-full mt-4"
				data-testid="dashboard-grid"
			>
				{/* Tasks section - spans 2/3 of width on large screens */}
				<div
					className="lg:col-span-2 lg:row-span-3"
					data-testid="tasks-section"
				>
					<Tasks tasks={displayTasks} />
				</div>

				{/* Sensors section - top right on large screens */}
				<div
					className="lg:row-span-1"
					data-testid="sensors-section"
				>
					<Sensors sensorData={displaySensorData} />
				</div>

				{/* Warnings section - bottom right on large screens */}
				<div
					className="lg:row-span-2"
					data-testid="warnings-section"
				>
					<Warnings warnings={displayWarnings} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
