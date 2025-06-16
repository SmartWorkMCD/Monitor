import type { MqttConfig } from "./services/MqttService";

export const mqttConfig: MqttConfig = {
  brokerUrl: 'ws://localhost:8083',
  username: 'admin',
  password: 'admin',
  topics: {
    // Core Workstation Brain topics
    candy: 'objdet/results',                    // YOLO candy detection results
    hand: 'hands/position',                     // Hand tracking positions
    task_assignment: 'v1/devices/me/attributes', // Task assignments
    management: 'management/interface',          // Management events
    projector: 'projector/control',             // Projector control
    telemetry: 'v1/devices/me/telemetry',       // Task telemetry data

    // Task Division integration
    task_publish: 'tasks/publish',              // Task Division -> Workstation
    task_subscribe: 'tasks/subscribe/brain',    // Workstation -> Task Division

    // Neighbors network topology
    neighbors_update: 'neighbors/update',       // BLE neighbor scanning
    station_neighbors: 'station/+/neighbors',  // Neighbor distance data
    station_version: 'station/+/version',      // Station versions
    station_is_master: 'station/+/is_master', // Master declarations
    topology_positions: 'topology/positions',  // Topology positions
    topology_graph: 'topology/graph',         // Network graph
    update_command: 'station/+/update'        // Update commands
  }
};
