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

// Event types matching Workstation Brain's management interface
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
    details: Record<string, any>;
};

export type PerformanceMetricsEvent = {
    timestamp: number;
    type: "performance_metrics";
    metrics: Record<string, any>;
};

export type ManagementEvent =
    | SystemStatusEvent
    | StateTransitionEvent
    | TaskUpdateEvent
    | RuleEvaluationEvent
	| UserActionEvent
	| PerformanceMetricsEvent;

// Workstation states from the Brain
export type WorkstationState =
    | "idle"
    | "waiting_for_task"
    | "cleaning"
    | "executing_task"
    | "waiting_confirmation"
    | "task_completed";

// Task mappings for different product types
export interface ProductConfig {
    [color: string]: number;
}

export interface TaskDefinition {
    task_name: string;
    task_description: string;
    rules: string[];
}

export interface WorkstationConfig {
    mqtt: {
        enabled: boolean;
        broker_ip: string;
        broker_port: number;
        username: string;
        password: string;
    };
    grid: {
        rows: number;
        cols: number;
        image_width: number;
        image_height: number;
    };
}
