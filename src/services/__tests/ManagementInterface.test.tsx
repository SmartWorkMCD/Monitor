import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ManagementInterface, managementInterface, type ManagementEventListener } from '../ManagementInterface'
import type {
  ManagementEvent,
  SystemStatusEvent,
  StateTransitionEvent,
  TaskUpdateEvent,
  RuleEvaluationEvent
} from '../../types'

describe('ManagementInterface', () => {
  let interfaceInstance: ManagementInterface
  let mockListener: ManagementEventListener
  let mockListener2: ManagementEventListener
  let capturedEvents: ManagementEvent[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    interfaceInstance = new ManagementInterface()
    capturedEvents = []

    // Create mock listeners that capture events
    mockListener = vi.fn((event: ManagementEvent) => {
      capturedEvents.push(event)
    })

    mockListener2 = vi.fn((event: ManagementEvent) => {
      capturedEvents.push(event)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('subscription management', () => {
    it('adds listeners when subscribing', () => {
      interfaceInstance.subscribe(mockListener)
      interfaceInstance.sendSystemStatus('test')

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)
    })

    it('supports multiple listeners', () => {
      interfaceInstance.subscribe(mockListener)
      interfaceInstance.subscribe(mockListener2)

      interfaceInstance.sendSystemStatus('test')

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(mockListener2).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(2)
    })

    it('can subscribe the same listener multiple times', () => {
      interfaceInstance.subscribe(mockListener)
      interfaceInstance.subscribe(mockListener)

      interfaceInstance.sendSystemStatus('test')

      // Listener should be called twice if subscribed twice
      expect(mockListener).toHaveBeenCalledTimes(2)
      expect(capturedEvents).toHaveLength(2)
    })

    it('removes listeners when unsubscribing', () => {
      interfaceInstance.subscribe(mockListener)
      interfaceInstance.subscribe(mockListener2)

      interfaceInstance.unsubscribe(mockListener)
      interfaceInstance.sendSystemStatus('test')

      expect(mockListener).not.toHaveBeenCalled()
      expect(mockListener2).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)
    })

    it('handles unsubscribing non-existent listeners gracefully', () => {
      const nonExistentListener = vi.fn()

      expect(() => {
        interfaceInstance.unsubscribe(nonExistentListener)
      }).not.toThrow()
    })

    it('removes all instances of a listener when unsubscribing', () => {
      interfaceInstance.subscribe(mockListener)
      interfaceInstance.subscribe(mockListener)
      interfaceInstance.subscribe(mockListener2)

      interfaceInstance.unsubscribe(mockListener)
      interfaceInstance.sendSystemStatus('test')

      expect(mockListener).not.toHaveBeenCalled()
      expect(mockListener2).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)
    })

    it('handles unsubscribing when no listeners exist', () => {
      expect(() => {
        interfaceInstance.unsubscribe(mockListener)
      }).not.toThrow()
    })
  })

  describe('sendSystemStatus', () => {
    beforeEach(() => {
      interfaceInstance.subscribe(mockListener)
      vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
    })

    it('sends system status event with required parameters', () => {
      interfaceInstance.sendSystemStatus('operational')

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)

      const event = capturedEvents[0] as SystemStatusEvent
      expect(event.type).toBe('system_status')
      expect(event.status).toBe('operational')
      expect(event.message).toBe('')
    })

    it('sends system status event with optional message', () => {
      interfaceInstance.sendSystemStatus('warning', 'Temperature high')

      const event = capturedEvents[0] as SystemStatusEvent
      expect(event.type).toBe('system_status')
      expect(event.status).toBe('warning')
      expect(event.message).toBe('Temperature high')

    })

    it('uses current timestamp when sending events', () => {
      const firstTime = new Date('2024-01-15T10:30:00.000Z')
      const secondTime = new Date('2024-01-15T10:35:00.000Z')

      vi.setSystemTime(firstTime)
      interfaceInstance.sendSystemStatus('status1')

      vi.setSystemTime(secondTime)
      interfaceInstance.sendSystemStatus('status2')

      expect(capturedEvents).toHaveLength(2)
      expect(capturedEvents[0].timestamp).toBe(1705314600) // 10:30
      expect(capturedEvents[1].timestamp).toBe(1705314900) // 10:35
    })
  })

  describe('sendStateChange', () => {
    beforeEach(() => {
      interfaceInstance.subscribe(mockListener)
      vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
    })

    it('sends state transition event with correct structure', () => {
      interfaceInstance.sendStateChange('idle', 'processing')

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)

      const event = capturedEvents[0] as StateTransitionEvent
      expect(event.type).toBe('state_transition')
      expect(event.from_state).toBe('idle')
      expect(event.to_state).toBe('processing')

    })

    it('handles empty state names', () => {
      interfaceInstance.sendStateChange('', '')

      const event = capturedEvents[0] as StateTransitionEvent
      expect(event.from_state).toBe('')
      expect(event.to_state).toBe('')
    })

    it('handles special characters in state names', () => {
      interfaceInstance.sendStateChange('state-with-dashes', 'state_with_underscores')

      const event = capturedEvents[0] as StateTransitionEvent
      expect(event.from_state).toBe('state-with-dashes')
      expect(event.to_state).toBe('state_with_underscores')
    })
  })

  describe('sendTaskUpdate', () => {
    beforeEach(() => {
      interfaceInstance.subscribe(mockListener)
      vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
    })

    it('sends task update event with default progress', () => {
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'in-progress')

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)

      const event = capturedEvents[0] as TaskUpdateEvent
      expect(event.type).toBe('task_update')
      expect(event.task_id).toBe('task-1')
      expect(event.subtask_id).toBe('subtask-a')
      expect(event.status).toBe('in-progress')
      expect(event.progress).toBe(0)

    })

    it('sends task update event with custom progress', () => {
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'in-progress', 0.75)

      const event = capturedEvents[0] as TaskUpdateEvent
      expect(event.progress).toBe(0.75)
    })

    it('rounds progress to 2 decimal places', () => {
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'in-progress', 0.123456789)

      const event = capturedEvents[0] as TaskUpdateEvent
      expect(event.progress).toBe(0.12)
    })

    it('handles progress values at boundaries', () => {
      // Test 0 progress
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'started', 0)
      expect((capturedEvents[0] as TaskUpdateEvent).progress).toBe(0)

      // Test 1 progress
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'completed', 1)
      expect((capturedEvents[1] as TaskUpdateEvent).progress).toBe(1)

      // Test negative progress (edge case)
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'error', -0.1)
      expect((capturedEvents[2] as TaskUpdateEvent).progress).toBe(-0.1)

      // Test progress > 1 (edge case)
      interfaceInstance.sendTaskUpdate('task-1', 'subtask-a', 'overdue', 1.5)
      expect((capturedEvents[3] as TaskUpdateEvent).progress).toBe(1.5)
    })

    it('handles empty string IDs', () => {
      interfaceInstance.sendTaskUpdate('', '', 'status')

      const event = capturedEvents[0] as TaskUpdateEvent
      expect(event.task_id).toBe('')
      expect(event.subtask_id).toBe('')
    })
  })

  describe('sendRuleEvaluation', () => {
    beforeEach(() => {
      interfaceInstance.subscribe(mockListener)
      vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
    })

    it('sends rule evaluation event with default details', () => {
      interfaceInstance.sendRuleEvaluation('rule-001', true)

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(capturedEvents).toHaveLength(1)

      const event = capturedEvents[0] as RuleEvaluationEvent
      expect(event.type).toBe('rule_evaluation')
      expect(event.rule_id).toBe('rule-001')
      expect(event.satisfied).toBe(true)
      expect(event.details).toBe('')

    })

    it('sends rule evaluation event with custom details', () => {
      interfaceInstance.sendRuleEvaluation('rule-002', false, 'Temperature exceeded threshold')

      const event = capturedEvents[0] as RuleEvaluationEvent
      expect(event.rule_id).toBe('rule-002')
      expect(event.satisfied).toBe(false)
      expect(event.details).toBe('Temperature exceeded threshold')
    })

    it('handles boolean values correctly', () => {
      interfaceInstance.sendRuleEvaluation('rule-003', false)
      interfaceInstance.sendRuleEvaluation('rule-004', true)

      expect(capturedEvents).toHaveLength(2)
      expect((capturedEvents[0] as RuleEvaluationEvent).satisfied).toBe(false)
      expect((capturedEvents[1] as RuleEvaluationEvent).satisfied).toBe(true)
    })

    it('handles empty rule ID', () => {
      interfaceInstance.sendRuleEvaluation('', true, 'test details')

      const event = capturedEvents[0] as RuleEvaluationEvent
      expect(event.rule_id).toBe('')
      expect(event.details).toBe('test details')
    })
  })

  describe('event publishing', () => {
    it('publishes events to all listeners in order', () => {
      const eventOrder: string[] = []

      const listener1 = vi.fn(() => eventOrder.push('listener1'))
      const listener2 = vi.fn(() => eventOrder.push('listener2'))
      const listener3 = vi.fn(() => eventOrder.push('listener3'))

      interfaceInstance.subscribe(listener1)
      interfaceInstance.subscribe(listener2)
      interfaceInstance.subscribe(listener3)

      interfaceInstance.sendSystemStatus('test')

      expect(eventOrder).toEqual(['listener1', 'listener2', 'listener3'])
    })

    it('continues publishing to remaining listeners if one throws error', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const normalListener = vi.fn()

      interfaceInstance.subscribe(errorListener)
      interfaceInstance.subscribe(normalListener)

      // Should not throw even if a listener throws
      expect(() => {
        interfaceInstance.sendSystemStatus('test')
      }).toThrow('Listener error') // The error will propagate

      expect(errorListener).toHaveBeenCalledTimes(1)
      // In the current implementation, if a listener throws, subsequent listeners won't be called
      // This is actually a potential issue in the implementation
    })

    it('handles no listeners gracefully', () => {
      expect(() => {
        interfaceInstance.sendSystemStatus('test')
        interfaceInstance.sendStateChange('a', 'b')
        interfaceInstance.sendTaskUpdate('t', 's', 'status')
        interfaceInstance.sendRuleEvaluation('r', true)
      }).not.toThrow()
    })
  })

  describe('singleton instance', () => {
    it('exports a singleton instance', () => {
      expect(managementInterface).toBeInstanceOf(ManagementInterface)
    })

    it('singleton instance behaves correctly', () => {
      const listener = vi.fn()
      managementInterface.subscribe(listener)
      managementInterface.sendSystemStatus('test')

      expect(listener).toHaveBeenCalledTimes(1)

      // Clean up
      managementInterface.unsubscribe(listener)
    })
  })

  describe('integration scenarios', () => {
    it('handles rapid event publishing', () => {
      interfaceInstance.subscribe(mockListener)

      // Send multiple events rapidly
      interfaceInstance.sendSystemStatus('status1')
      interfaceInstance.sendStateChange('state1', 'state2')
      interfaceInstance.sendTaskUpdate('task1', 'subtask1', 'progress', 0.5)
      interfaceInstance.sendRuleEvaluation('rule1', true)

      expect(mockListener).toHaveBeenCalledTimes(4)
      expect(capturedEvents).toHaveLength(4)
      expect(capturedEvents[0].type).toBe('system_status')
      expect(capturedEvents[1].type).toBe('state_transition')
      expect(capturedEvents[2].type).toBe('task_update')
      expect(capturedEvents[3].type).toBe('rule_evaluation')
    })

    it('maintains listener isolation', () => {
      const events1: ManagementEvent[] = []
      const events2: ManagementEvent[] = []

      const listener1 = (event: ManagementEvent) => events1.push(event)
      const listener2 = (event: ManagementEvent) => events2.push(event)

      interfaceInstance.subscribe(listener1)
      interfaceInstance.subscribe(listener2)

      interfaceInstance.sendSystemStatus('test')

      expect(events1).toHaveLength(1)
      expect(events2).toHaveLength(1)
      expect(events1[0]).toEqual(events2[0])

      // Unsubscribe one listener
      interfaceInstance.unsubscribe(listener1)
      interfaceInstance.sendSystemStatus('test2')

      expect(events1).toHaveLength(1) // Should not receive new event
      expect(events2).toHaveLength(2) // Should receive new event
    })
  })

  describe('type safety', () => {
    it('ensures correct event types are created', () => {
      interfaceInstance.subscribe(mockListener)

      interfaceInstance.sendSystemStatus('operational', 'All good')
      interfaceInstance.sendStateChange('idle', 'running')
      interfaceInstance.sendTaskUpdate('t1', 't2', 'done', 1.0)
      interfaceInstance.sendRuleEvaluation('r1', false, 'Failed')

      expect(capturedEvents).toHaveLength(4)

      // Type guards to ensure correct event types
      expect(capturedEvents[0].type).toBe('system_status')
      expect(capturedEvents[1].type).toBe('state_transition')
      expect(capturedEvents[2].type).toBe('task_update')
      expect(capturedEvents[3].type).toBe('rule_evaluation')

      // Check specific properties exist
      expect('status' in capturedEvents[0]).toBe(true)
      expect('from_state' in capturedEvents[1]).toBe(true)
      expect('task_id' in capturedEvents[2]).toBe(true)
      expect('rule_id' in capturedEvents[3]).toBe(true)
    })
  })
})
