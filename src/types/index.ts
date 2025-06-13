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

export type SystemStatusEvent = {
    timestamp: number;
    type: "system_status";
    status: string;
    message: string;
};

export type StateTransitionEvent = {
    timestamp: number;
    type: "state_transition";
    from_state: string;
    to_state: string;
};

export type TaskUpdateEvent = {
    timestamp: number;
    type: "task_update";
    task_id: string;
    subtask_id: string;
    status: string;
    progress: number;
};

export type RuleEvaluationEvent = {
    timestamp: number;
    type: "rule_evaluation";
    rule_id: string;
    satisfied: boolean;
    details: string;
};

export type UserActionEvent = {
    timestamp: number;
    type: "user_action";
    action: string;
    data: {
        subtask_id: string;
        message: string;
    };
};

export type PerformanceMetricsEvent = {
    timestamp: number;
    type: "performance_metrics";
    data: {
        task_completion_time: number;
        subtask_id: string;
    };
};

export type ManagementEvent =
    | SystemStatusEvent
    | StateTransitionEvent
    | TaskUpdateEvent
    | RuleEvaluationEvent
	| UserActionEvent
	| PerformanceMetricsEvent;
