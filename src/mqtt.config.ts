
import type { MqttConfig } from "./services/MqttService";

export const mqttConfig: MqttConfig = {
  brokerUrl: 'ws://localhost:8083',
  username: 'admin',
  password: 'admin',
  topics: {
    // Main topic for receiving updates from Workstation Brain
    management: 'management/interface',
    // Topic for projector control messages (additional context)
    projector: 'projector/control',
    // Topic for telemetry data (task completion timing)
    telemetry: 'v1/devices/me/telemetry'
  }
};
