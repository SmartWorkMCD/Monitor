import type { Task, Warning, SensorData } from '../types'

export const mockTasks: Task[] = [
  {
    id: 1,
    title: "Check sugar level in mixing tanks",
    status: "pending",
    deadline: 1747501529000
  },
  {
    id: 2,
    title: "Clean chocolate coating machine",
    status: "completed",
    deadline: 1747401529000
  },
  {
    id: 3,
    title: "Inspect candy cooling conveyor",
    status: "in-progress",
    deadline: 1747301529000
  }
]

export const mockWarnings: Warning[] = [
  {
    id: 1,
    severity: "high",
    message: "Temperature anomaly in chocolate tempering unit",
    timestamp: 1747401716000
  },
  {
    id: 2,
    severity: "medium",
    message: "Sugar syrup viscosity outside acceptable range",
    timestamp: 1737401716000
  },
  {
    id: 3,
    severity: "low",
    message: "Scheduled maintenance due for wrapping machine",
    timestamp: 1727401716000
  }
]

export const mockSensorData: SensorData = {
  temperature: 32.4,
  temperatureChange: -1.2,
  humidity: 45,
  humidityChange: 2.5,
  pressure: 760,
  powerUsage: 4.2,
  powerUsageChange: 0.1,
  status: "Operational",
  maintenanceDate: 1757401797000
}
