import stateManager from './state/stateManager';
import { createAgent, AgentType } from './agents/agentFactory';
import { Task } from './tasks/Task';

async function run() {
    console.log('--- VISTAMATIONS Core Engine: Starting Run Loop ---');
    stateManager.updateState({ status: 'running' });

    const initialTask: Task = {
        id: `task-${Date.now()}-manage`,
        agentType: 'manager',
        input: { goal: 'Write a TypeScript function that reverses a string' },
        status: 'pending',
    };
    stateManager.enqueueTask(initialTask);

    let nextTask: Task | undefined;
    while ((nextTask = stateManager.dequeueTask()) !== undefined) {
        const task: Task = { ...nextTask };

        console.log(`\nProcessing task ${task.id} for agent: ${task.agentType}`);
        task.status = 'in-progress';

        try {
            const agent = createAgent(task.agentType as AgentType);
            const output = await agent.executeTask(stateManager, task.input);

            task.status = 'completed';
            task.output = output;
            console.log(`Task ${task.id} completed successfully. Output:`, output);

            if (task.agentType === 'manager' && Array.isArray(output)) {
                console.log(`[Runner] Manager returned a plan with ${output.length} sub-tasks. Enqueuing them...`);
                output.forEach((planItem: { agentType: string; input: any }, index: number) => {
                    const subTask: Task = {
                        id: `task-${Date.now()}-${index}`,
                        agentType: planItem.agentType as AgentType,
                        input: planItem.input,
                        status: 'pending',
                    };
                    stateManager.enqueueTask(subTask);
                    console.log(`  Enqueued task ${subTask.id} for agent ${subTask.agentType}`);
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            task.status = 'failed';
            task.error = errorMessage;
            console.error(`Task ${task.id} failed. Error:`, errorMessage);
        }
    }

    console.log('\n--- VISTAMATIONS Core Engine: Run Loop Finished ---');
    stateManager.updateState({ status: 'stopped' });
}

run().catch(console.error);
