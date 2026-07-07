// src/runner.ts

import stateManager from './state/stateManager';
import { createAgent, AgentType } from './agents/agentFactory';
import { Task } from './tasks/Task';

async function run() {
    console.log('--- VISTAMATIONS Core Engine: Starting Run Loop ---');
    stateManager.updateState({ status: 'running' });

    // 1. Seed the queue with an initial task
    const initialTask: Task = {
        id: `task-${Date.now()}-manage`,
        agentType: 'manager',
        input: { goal: 'Handle a sample customer service inquiry about return policy' },
        status: 'pending',
    };
    stateManager.enqueueTask(initialTask);

    // 2. Loop while tasks are in the queue
    let nextTask: Task | undefined;
    while ((nextTask = stateManager.dequeueTask()) !== undefined) {
        // The object from dequeueTask is mutable within this scope, but for clarity
        // and to avoid side-effects if the underlying state logic changes, we'll work with a copy.
        const task: Task = { ...nextTask };

        console.log(`\nProcessing task ${task.id} for agent: ${task.agentType}`);
        task.status = 'in-progress';

        try {
            // 3. Create agent and execute task
            const agent = createAgent(task.agentType as AgentType);
            const output = await agent.executeTask(stateManager, task.input);
            
            // 4. Handle success
            task.status = 'completed';
            task.output = output;
            console.log(`Task ${task.id} completed successfully. Output:`, output);
        } catch (error) {
            // 5. Handle failure
            const errorMessage = error instanceof Error ? error.message : String(error);
            task.status = 'failed';
            task.error = errorMessage;
            console.error(`Task ${task.id} failed. Error:`, errorMessage);
            // The loop continues to the next task
        }
    }

    // 6. End of loop
    console.log('\n--- VISTAMATIONS Core Engine: Run Loop Finished ---');
    stateManager.updateState({ status: 'stopped' });
    // console.log('Final state:', stateManager.getState());
}

// Start the process
run().catch(console.error);
