// src/state/stateManager.ts

import { Task } from '../tasks/Task';

/**
 * Defines the structure of the application's state.
 * This will evolve as we add more features like agent management.
 */
export interface ApplicationState {
    startTime: Date;
    status: 'initializing' | 'running' | 'stopping' | 'stopped';
    activeAgents: number;
    tasks: Task[];
}

export class StateManager {
    private state: ApplicationState;

    constructor() {
        this.state = {
            startTime: new Date(),
            status: 'initializing',
            activeAgents: 0,
            tasks: [],
        };
    }

    /**
     * Returns a read-only copy of the current state.
     */
    public getState(): Readonly<ApplicationState> {
        return { ...this.state };
    }

    /**
     * Updates one or more properties of the state.
     * @param newState A partial state object to merge into the current state.
     */
    public updateState(newState: Partial<ApplicationState>): void {
        this.state = { ...this.state, ...newState };
        // Avoid noisy logging for every single state update
        // console.log('State updated:', this.state);
    }

    /**
     * Adds a task to the end of the queue.
     * @param task The task to enqueue.
     */
    public enqueueTask(task: Task): void {
        const newTasks = [...this.state.tasks, task];
        this.updateState({ tasks: newTasks });
        console.log(`Task enqueued: ${task.id}. Total tasks: ${newTasks.length}`);
    }

    /**
     * Removes and returns the task at the front of the queue.
     * @returns The next task, or undefined if the queue is empty.
     */
    public dequeueTask(): Task | undefined {
        if (this.state.tasks.length === 0) {
            return undefined;
        }
        const nextTask = this.state.tasks[0];
        const remainingTasks = this.state.tasks.slice(1);
        this.updateState({ tasks: remainingTasks });
        console.log(`Task dequeued: ${nextTask.id}. Remaining tasks: ${remainingTasks.length}`);
        return nextTask;
    }
}


// Export a singleton instance of the StateManager
const stateManager = new StateManager();
export default stateManager;
