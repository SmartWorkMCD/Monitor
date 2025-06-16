export interface Task {
	id: number;
	title: string;
	status: TaskStatus;
	deadline: number;
	task_id?: string;
	subtask_id?: string;
	progress?: number;
	duration?: number;
	product_id?: string;
}

export type TaskStatus = "pending" | "in-progress" | "completed" | "started" | "waiting_confirmation" | "failed";

export interface Warning {
	id: number;
	severity: WarningSeverity;
	message: string;
	timestamp: number;
	rule_id?: string;
	details?: string;
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
	// Real-time data from workstation
	gridActivity?: GridActivity;
	handPosition?: HandPosition;
	candyDetection?: CandyDetection;
	taskProgress?: TaskProgress;
}

export type SystemStatus = "Operational" | "Warning" | "Critical";

export interface SensorMetric {
	value: number;
	unit: string;
	change?: number;
	changeUnit?: string;
	changeType?: "increase" | "decrease" | "stable";
}

// Real workstation data structures

// Candy Detection (YOLO format)
export interface CandyDetection {
	detections: CandyDetectionItem[];
	timestamp: number;
	total_candies: number;
	colors_detected: Record<string, number>;
	in_validation_area: boolean;
}

export interface CandyDetectionItem {
	class: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	score: number;
	center_x: number;
	center_y: number;
	width: number;
	height: number;
}

// Hand Tracking
export interface HandPosition {
	left_hand?: HandCoordinates;
	right_hand?: HandCoordinates;
	timestamp: number;
	grid_cell?: GridCell;
	in_confirmation_area?: boolean;
}

export interface HandCoordinates {
	x: number; // Normalized 0-1
	y: number; // Normalized 0-1
	confidence?: number;
}

export interface GridCell {
	row: number;
	col: number;
}

// Grid Activity
export interface GridActivity {
	rows: number;
	cols: number;
	image_width: number;
	image_height: number;
	active_cells: GridCell[];
	confirmation_cell: GridCell;
	validation_area: ValidationArea;
}

export interface ValidationArea {
	x_min: number;
	y_min: number;
	x_max: number;
	y_max: number;
	percentage: number;
}

// Task Progress
export interface TaskProgress {
	current_tasks: TaskExecution[];
	completed_tasks: TaskCompletion[];
	task_queue: string[];
	active_product?: string;
}

export interface TaskExecution {
	task_id: string;
	subtask_id: string;
	status: TaskStatus;
	progress: number;
	start_time?: number;
	expected_duration?: number;
	product_id?: string;
}

export interface TaskCompletion {
	task_id: string;
	subtask_id?: string;
	duration: number;
	timestamp: number;
	product_id?: string;
	success: boolean;
}

// Product Configuration
export interface ProductConfig {
	[color: string]: number;
}

export interface ProductDefinition {
	name: string;
	config: ProductConfig;
	tasks: string[];
	description?: string;
}

// Task Division Integration
export interface TaskDivisionAssignment {
	tasks: Record<string, string[]>;
	products: Record<string, ProductDefinition>;
	timestamp: number;
}

// Neighbors Network Topology
export interface NeighborsData {
	stations: StationInfo[];
	topology: NetworkTopology;
	ble_connections: BLEConnection[];
	master_station?: string;
	last_update: number;
}

export interface StationInfo {
	id: string;
	version: string;
	is_master: boolean;
	position?: Position;
	neighbors: string[];
	last_seen: number;
	status: StationStatus;
}

export type StationStatus = "online" | "offline" | "updating" | "error";

export interface NetworkTopology {
	positions: Record<string, Position>;
	connections: Connection[];
	graph: TopologyGraph;
}

export interface Position {
	x: number;
	y: number;
	z?: number;
}

export interface Connection {
	from: string;
	to: string;
	distance: number;
	variance: number;
	strength: number;
}

export interface TopologyGraph {
	nodes: TopologyNode[];
	edges: TopologyEdge[];
}

export interface TopologyNode {
	id: string;
	position: Position;
	type: "station" | "workstation" | "master";
	status: StationStatus;
}

export interface TopologyEdge {
	source: string;
	target: string;
	distance: number;
	type: "ble" | "physical" | "logical";
}

export interface BLEConnection {
	station: string;
	left_neighbor?: string;
	right_neighbor?: string;
	timestamp: number;
	scan_results?: BLEScanResult[];
}

export interface BLEScanResult {
	mac_address: string;
	rssi: number;
	distance_estimate: number;
	last_seen: number;
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

// Real-time metrics for dashboard
export interface RealTimeMetrics {
	candy_detection_rate: number;    // Detections per minute
	hand_tracking_accuracy: number;  // Percentage accuracy
	task_completion_rate: number;    // Tasks per hour
	system_efficiency: number;       // Overall efficiency percentage
	network_latency: number;         // MQTT latency in ms
	error_rate: number;              // Errors per hour
}

// Dashboard state with real data
export interface DashboardState {
	sensor_data: SensorData;
	real_time_metrics: RealTimeMetrics;
	tasks: Task[];
	warnings: Warning[];
	candy_detection: CandyDetection | null;
	hand_position: HandPosition | null;
	grid_activity: GridActivity;
	task_progress: TaskProgress;
	neighbors_data: NeighborsData;
	system_status: SystemStatus;
	connection_status: ConnectionStatus;
}

export interface ConnectionStatus {
	mqtt_connected: boolean;
	last_data_received: number;
	topics_subscribed: string[];
	message_count: number;
	error_count: number;
}
