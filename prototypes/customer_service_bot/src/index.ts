// Customer Service Bot Prototype - Entry Point

import stateManager, { Agent, StateManager, Task } from 'core_engine';
import { createCSAgent, CSAgentType } from './agentFactory';

/**
 * Seeds the task queue with an initial task to kick off the customer service workflow.
 */
function seedTaskQueue() {
    console.log('--- Seeding Task Queue for Customer Service Bot ---');
    const initialTask: Task = {
        id: `cs-task-${Date.now()}-init`,
        // Note: The agentType here MUST be compatible with the Task interface from core_engine.
        // We are casting our local agent type for compatibility.
        agentType: 'greeting', 
        input: { customerName: 'Pete' },
        status: 'pending',
    };
    stateManager.enqueueTask(initialTask);
    console.log('--- CS Task Queue Seeded ---\n');
}

/**
 * The main processing loop for the prototype.
 * This function is the "application" that USES the core_engine library.
 */
async function coreLoop() {
    console.log('--- CS Bot Core Loop Started ---');
    while (stateManager.getState().tasks.length > 0) {
        const task = stateManager.dequeueTask();
        if (!task) continue;

        console.log(`\nProcessing CS task: ${task.id} (${task.agentType})`);
        try {
            // Use our local customer service agent factory
            const agent = createCSAgent(task.agentType as CSAgentType);
            stateManager.updateState({ activeAgents: stateManager.getState().activeAgents + 1 });
            console.log(`> Dispatched to agent: ${agent.name}`);
            
            // Execute task
            task.status = 'in-progress';
            const output = await agent.executeTask(stateManager, task.input);
            task.status = 'completed';
            task.output = output;

            console.log(`> Task ${task.id} completed successfully.`);
            stateManager.updateState({ activeAgents: stateManager.getState().activeAgents - 1 });

        } catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : String(error);
            console.error(`> Task ${task.id} failed: ${task.error}`);
        }
    }
    console.log('\n--- CS Bot Core Loop Finished: Task queue is empty ---');
}

async function main() {
    console.log('[VISTAMATIONS Customer Service Bot] - Initializing...');
    stateManager.updateState({ status: 'running', tasks: [] }); // Reset state

    seedTaskQueue();

    await coreLoop();

    console.log(`\n[VISTAMATIONS Customer Service Bot] - All tasks processed. Shutting down.`);
    stateManager.updateState({ status: 'stopped' });
    console.log('Final state:', stateManager.getState());
}

// Execute the main function
main();
