import { Agent, StateManager, Task } from 'core_engine';

/**
 * A specialized agent to welcome the user and kick off the support workflow.
 */
export class GreetingAgent implements Agent {
    public readonly id = 'cs-greeting-001';
    public readonly name = 'CS Greeting Agent';

    public async executeTask(stateManager: StateManager, input?: { customerName: string }): Promise<string> {
        const customerName = input?.customerName || 'valued customer';
        const message = `Welcome to VISTAMATIONS support, ${customerName}! How can I help you today?`;

        console.log(`[${this.name}] says: ${message}`);

        // Create a follow-up task for the FAQ agent to answer a common question
        const followupTask: Task = {
            id: `task-${Date.now()}-faq`,
            agentType: 'faq', // This type will be handled by our local factory
            input: { question: 'What are your business hours?' },
            status: 'pending',
        };
        stateManager.enqueueTask(followupTask);

        return `Greeting delivered. Enqueued followup task for FAQAgent.`;
    }
}
