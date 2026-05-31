import { vi } from 'vitest'

// Mock MQTT client instance
export const mockMqttClient = {
  on: vi.fn(),
  off: vi.fn(),
  subscribe: vi.fn((topic: string, callback?: (err?: Error) => void) => {
    if (callback) callback()
  }),
  unsubscribe: vi.fn((topic: string, callback?: (err?: Error) => void) => {
    if (callback) callback()
  }),
  publish: vi.fn((topic: string, message: string, callback?: (err?: Error) => void) => {
    if (callback) callback()
  }),
  connect: vi.fn((uri: string, options?: any, callback?: () => void) => {
    if (callback) callback()
    return mockMqttClient
  }),
  disconnect: vi.fn((force?: boolean, callback?: (err?: Error) => void) => {
    if (callback) callback()
  }),
  reconnect: vi.fn(),
  end: vi.fn((force?: boolean, callback?: () => void) => {
    if (callback) callback()
  }),
  connected: false,
  reconnecting: false,
  queueQueueing: false,
  outgoingStore: null,
  incomingStore: null,
}

// Mock mqtt.connect function
const mqtt = vi.fn(() => mockMqttClient)

mqtt.connect = vi.fn(() => mockMqttClient)

export default mqtt
export type MqttClient = typeof mockMqttClient
