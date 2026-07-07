// src/tasks/Task.ts

/**
 * Defines the structure for a single task to be executed by an agent.
 */
export interface Task {
    readonly id: string;
    agentType: string; // Allow for any agent type
    input: any;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    output?: any;
    error?: string;
}
