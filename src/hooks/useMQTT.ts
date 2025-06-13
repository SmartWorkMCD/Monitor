// src/hooks/useMQTT.ts
import { useEffect, useRef, useState } from 'react'
import type { SensorData, Task, Warning } from '../types'

interface MQTTConfig {
  broker: string
  port: number
  username?: string
  password?: string
}

interface MQTTData {
  sensorData: SensorData | null
  tasks: Task[]
  warnings: Warning[]
  isConnected: boolean
  connectionError: string | null
}

export const useMQTT = (config: MQTTConfig): MQTTData => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const clientRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const connectMQTT = async () => {
      try {
        // Using mqtt.js for web client
        const mqtt = await import('mqtt')

        const clientId = `monitor_${Math.random().toString(16).slice(2, 8)}`
        const connectUrl = `ws://${config.broker}:${config.port + 1}/mqtt` // WebSocket port

        const client = mqtt.connect(connectUrl, {
          clientId,
          username: config.username,
          password: config.password,
          clean: true,
          reconnectPeriod: 5000,
        })

        client.on('connect', () => {
          console.log('[MQTT] Connected to broker')
          setIsConnected(true)
          setConnectionError(null)

          // Subscribe to all relevant topics
          const topics = [
            'management/interface',      // From Workstation Brain
            'hands/position',           // From Hand Tracking
            'objdet/results',          // From Object Detection
            'v1/devices/me/telemetry', // From Task Division
            'tasks/update',            // Task updates
            'system/warnings'          // System warnings
          ]

          topics.forEach(topic => {
            client.subscribe(topic, (err) => {
              if (err) {
                console.error(`[MQTT] Failed to subscribe to ${topic}:`, err)
              } else {
                console.log(`[MQTT] Subscribed to ${topic}`)
              }
            })
          })
        })

        client.on('message', (topic, message) => {
          try {
            const data = JSON.parse(message.toString())
            handleMessage(topic, data)
          } catch (error) {
            console.error('[MQTT] Failed to parse message:', error)
          }
        })

        client.on('error', (error) => {
          console.error('[MQTT] Connection error:', error)
          setConnectionError(error.message)
          setIsConnected(false)
        })

        client.on('disconnect', () => {
          console.log('[MQTT] Disconnected from broker')
          setIsConnected(false)
        })

        clientRef.current = client

      } catch (error) {
        console.error('[MQTT] Failed to initialize:', error)
        setConnectionError('Failed to initialize MQTT client')

        // Retry connection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connectMQTT, 5000)
      }
    }

    const handleMessage = (topic: string, data: any) => {
      switch (topic) {
        case 'management/interface':
          handleManagementMessage(data)
          break
        case 'hands/position':
          handleHandMessage(data)
          break
        case 'objdet/results':
          handleDetectionMessage(data)
          break
        case 'v1/devices/me/telemetry':
          handleTelemetryMessage(data)
          break
        case 'tasks/update':
          handleTaskUpdate(data)
          break
        case 'system/warnings':
          handleWarningMessage(data)
          break
      }
    }

    const handleManagementMessage = (data: any) => {
      if (data.type === 'system_status') {
        // Update system status in sensor data
        setSensorData(prev => prev ? {
          ...prev,
          status: mapSystemStatus(data.status),
        } : null)
      } else if (data.type === 'task_update') {
        handleTaskUpdate(data)
      }
    }

    const handleHandMessage = (data: any) => {
      // Process hand tracking data for interaction monitoring
      console.log('[MQTT] Hand position update:', data)
    }

    const handleDetectionMessage = (data: any) => {
      // Process object detection results
      console.log('[MQTT] Object detection update:', data)
    }

    const handleTelemetryMessage = (data: any) => {
      // Update sensor data from telemetry
      if (data.temperature !== undefined) {
        setSensorData(prev => ({
          ...prev,
          temperature: data.temperature,
          temperatureChange: data.temperatureChange || 0,
          humidity: data.humidity || prev?.humidity || 45,
          humidityChange: data.humidityChange || 0,
          pressure: data.pressure || prev?.pressure || 760,
          powerUsage: data.powerUsage || prev?.powerUsage || 4.2,
          powerUsageChange: data.powerUsageChange || 0,
          status: prev?.status || 'Operational',
          maintenanceDate: prev?.maintenanceDate || Date.now() + 86400000 * 7,
        }))
      }
    }

    const handleTaskUpdate = (data: any) => {
      if (data.task_id && data.subtask_id) {
        setTasks(prev => {
          const existingIndex = prev.findIndex(t => t.id === data.task_id)
          const updatedTask: Task = {
            id: data.task_id,
            title: data.subtask_id,
            status: mapTaskStatus(data.status),
            deadline: Date.now() + 86400000, // 24 hours from now
          }

          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = updatedTask
            return updated
          } else {
            return [...prev, updatedTask]
          }
        })
      }
    }

    const handleWarningMessage = (data: any) => {
      const warning: Warning = {
        id: data.id || Date.now(),
        severity: data.severity || 'medium',
        message: data.message || 'System warning',
        timestamp: data.timestamp || Date.now(),
      }

      setWarnings(prev => [warning, ...prev.slice(0, 9)]) // Keep last 10 warnings
    }

    const mapSystemStatus = (status: string) => {
      switch (status.toLowerCase()) {
        case 'operational':
        case 'idle':
        case 'active':
          return 'Operational'
        case 'warning':
          return 'Warning'
        case 'error':
        case 'critical':
          return 'Critical'
        default:
          return 'Operational'
      }
    }

    const mapTaskStatus = (status: string) => {
      switch (status.toLowerCase()) {
        case 'started':
        case 'in_progress':
          return 'in-progress'
        case 'completed':
          return 'completed'
        case 'pending':
        default:
          return 'pending'
      }
    }

    connectMQTT()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (clientRef.current) {
        clientRef.current.end()
      }
    }
  }, [config])

  return {
    sensorData,
    tasks,
    warnings,
    isConnected,
    connectionError
  }
}
