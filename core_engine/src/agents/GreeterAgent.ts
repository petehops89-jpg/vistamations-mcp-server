// src/agents/GreeterAgent.ts

import { Agent } from './Agent';
import { StateManager } from '../state/stateManager';
import { Task } from '../tasks/Task';

/**
 * A simple agent whose task is to log a greeting and then create a new task for another agent.
 */
export class GreeterAgent implements Agent {
    public readonly id = 'greeter-001';
    public readonly name = 'Greeter Agent';

    public async executeTask(stateManager: StateManager, input?: { message: string }): Promise<string> {
        const message = input?.message || 'Hello, World! The first agent is online.';
        console.log(`[${this.name}] says: ${message}`);

        // --- Inter-Agent Communication ---
        // This agent will now create a new task for the Summarizer agent.
        console.log(`[${this.name}] is creating a new task for the Summarizer Agent.`);
        
        const textToSummarize = "The Master Control Program is a complex system designed to orchestrate multiple autonomous agents. "
            + "Each agent has a specific skill, and they collaborate by creating and processing tasks from a central queue. "
            + "This decoupling allows for a flexible and scalable architecture where new capabilities can be added by simply introducing new agent types.";

        const newTask: Task = {
            id: `task-${Date.now()}-summarize`,
            agentType: 'summarizer',
            input: { text: textToSummarize },
            status: 'pending',
        };

        stateManager.enqueueTask(newTask);
        
        return `Greeting delivered and new 'summarizer' task enqueued.`;
    }
}
