// src/agents/Agent.ts

import { StateManager } from '../state/stateManager';

/**
 * Represents the basic structure of an Agent.
 * Each agent has an ID, a name, and a primary task execution method.
 */
export interface Agent {
    readonly id: string;
    readonly name: string;

    /**
     * The main function for an agent to perform its designated task.
     * @param stateManager The global state manager, allowing agents to interact with the system state (e.g., enqueue new tasks).
     * @param input Optional data or context required for the task.
     * @returns A promise that resolves with the result of the task.
     */
    executeTask(stateManager: StateManager, input?: any): Promise<any>;
}
