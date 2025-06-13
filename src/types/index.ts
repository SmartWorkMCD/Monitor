export interface Task {
	id: string;
	taskId: string;
	subtaskId: string;
	title: string;
	status: TaskStatus;
	progress: number;
	deadline: number;
	lastUpdate: number;
}

export type TaskStatus = "started" | "in_progress" | "waiting_confirmation" | "completed" | "failed";

export interface Warning {
	id: number;
	type: WarningType;
	ruleId?: string;
	severity: WarningSeverity;
	message: string;
	details?: string;
	satisfied?: boolean;
	systemStatus?: SystemStatusValue;
	timestamp: number;
}

export type WarningType = "rule_evaluation" | "system_status" | "state_transition";
export type WarningSeverity = "low" | "medium" | "high";

export interface StateTransition {
	fromState: string;
	toState: string;
	timestamp: number;
}

export interface SensorData {
	temperature: number;
	temperatureChange: number;
	humidity: number;
	humidityChange: number;
	pressure: number;
	powerUsage: number;
	powerUsageChange: number;
	status: SystemStatusValue;
	systemMessage?: string;
	maintenanceDate: number;
	lastStateTransition?: StateTransition;
}

export type SystemStatus = "Operational" | "Warning" | "Critical";
export type SystemStatusValue = "idle" | "active" | "error" | "cleaning" | "waiting_confirmation" ;

export interface SensorMetric {
	value: number;
	unit: string;
	change?: number;
	changeUnit?: string;
	changeType?: "increase" | "decrease" | "stable";
}

// MQTT Message Types (matching Python publisher structure)
export interface MQTTSystemStatusMessage {
	timestamp: number;
	type: "system_status";
	status: SystemStatusValue;
	message: string;
}

export interface MQTTTaskUpdateMessage {
	timestamp: number;
	type: "task_update";
	task_id: string;
	subtask_id: string;
	status: TaskStatus;
	progress: number;
}

export interface MQTTRuleEvaluationMessage {
	timestamp: number;
	type: "rule_evaluation";
	rule_id: string;
	satisfied: boolean;
	details: string;
}

export interface MQTTStateTransitionMessage {
	timestamp: number;
	type: "state_transition";
	from_state: string;
	to_state: string;
}

export type MQTTMessage =
	| MQTTSystemStatusMessage
	| MQTTTaskUpdateMessage
	| MQTTRuleEvaluationMessage
	| MQTTStateTransitionMessage;
