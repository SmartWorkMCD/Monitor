export interface Task {
	id: number;
	title: string;
	status: TaskStatus;
	deadline: number;
}

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Warning {
	id: number;
	severity: WarningSeverity;
	message: string;
	timestamp: number;
}

export type WarningSeverity = "low" | "medium" | "high";

export interface SensorData {
	temperature: number;
	temperatureChange: number;
	humidity: number;
	humidityChange: number;
	pressure: number;
	powerUsage: number;
	powerUsageChange: number;
	status: SystemStatus;
	maintenanceDate: number;
}

export type SystemStatus = "Operational" | "Warning" | "Critical";

export interface SensorMetric {
	value: number;
	unit: string;
	change?: number;
	changeUnit?: string;
	changeType?: "increase" | "decrease" | "stable";
}
