import Tasks from "./Tasks";
import Warnings from "./Warnings";
import Sensors from "./Sensors";
import type { Task, Warning, SensorData } from "../types";

// Import mock data - in production, these would come from API calls
import sensorData from "../mocks/sensorData.json";
import warnings from "../mocks/warnings.json";
import tasks from "../mocks/tasks.json";

const Dashboard = () => {
	// Type assertion for mock data to ensure type safety
	const typedSensorData = sensorData as SensorData;
	const typedWarnings = warnings as Warning[];
	const typedTasks = tasks as Task[];

	return (
		<div className="h-screen bg-gray-100 p-4" data-testid="dashboard-container">
			{/* Improved grid layout with better responsive design */}
			<div
				className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 lg:grid-rows-3 gap-4 h-full"
				data-testid="dashboard-grid"
			>
				{/* Tasks section - spans 2/3 of width on large screens */}
				<div
					className="lg:col-span-2 lg:row-span-3"
					data-testid="tasks-section"
				>
					<Tasks tasks={typedTasks} />
				</div>

				{/* Sensors section - top right on large screens */}
				<div
					className="lg:row-span-1"
					data-testid="sensors-section"
				>
					<Sensors sensorData={typedSensorData} />
				</div>

				{/* Warnings section - bottom right on large screens */}
				<div
					className="lg:row-span-2"
					data-testid="warnings-section"
				>
					<Warnings warnings={typedWarnings} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
