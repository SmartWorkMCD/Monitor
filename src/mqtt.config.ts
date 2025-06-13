import type { MqttConfig } from "./services/MqttService";

export const mqttConfig: MqttConfig = {
  brokerUrl: 'ws://localhost:8083',
  username: 'admin',
  password: 'admin',
  topics: {
    management: 'management/interface',
    projector: 'projector/control',
    telemetry: 'v1/devices/me/telemetry'
  }
};
