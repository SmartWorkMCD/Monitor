import type { ManagementEvent, RuleEvaluationEvent, StateTransitionEvent, SystemStatusEvent, TaskUpdateEvent } from "../types";

export type ManagementEventListener = (event: ManagementEvent) => void;

export class ManagementInterface {
    private listeners: ManagementEventListener[] = [];

    subscribe(listener: ManagementEventListener) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: ManagementEventListener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    private publish(event: ManagementEvent) {
        for (const listener of this.listeners) {
            listener(event);
        }
    }

    sendSystemStatus(status: string, message = "") {
        const event: SystemStatusEvent = {
            timestamp: Date.now() / 1000,
            type: "system_status",
            status,
            message,
        };
        this.publish(event);
    }

    sendStateChange(fromState: string, toState: string) {
        const event: StateTransitionEvent = {
            timestamp: Date.now() / 1000,
            type: "state_transition",
            from_state: fromState,
            to_state: toState,
        };
        this.publish(event);
    }

    sendTaskUpdate(taskId: string, subtaskId: string, status: string, progress = 0) {
        const event: TaskUpdateEvent = {
            timestamp: Date.now() / 1000,
            type: "task_update",
            task_id: taskId,
            subtask_id: subtaskId,
            status,
            progress: Math.round(progress * 100) / 100,
        };
        this.publish(event);
    }

    sendRuleEvaluation(ruleId: string, satisfied: boolean, details = "") {
        const event: RuleEvaluationEvent = {
            timestamp: Date.now() / 1000,
            type: "rule_evaluation",
            rule_id: ruleId,
            satisfied,
            details,
        };
        this.publish(event);
    }
}

export const managementInterface = new ManagementInterface();
