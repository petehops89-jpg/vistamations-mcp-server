--- src/agents/ManagerAgent.ts ---
import OpenAI from 'openai';
import { Agent } from './Agent';
import { StateManager } from '../state/stateManager';

// Load .env file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const deepseekClient = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
});

export class ManagerAgent implements Agent {
    public readonly id = 'manager-001';
    public readonly name = 'Manager Agent';

    public async executeTask(stateManager: StateManager, input: { goal: string }): Promise<any> {
        if (!input?.goal) {
            throw new Error('Goal is required for the Manager Agent.');
        }

        console.log(`[${this.name}] Received goal: "${input.goal}"`);
        console.log(`[${this.name}] Decomposing goal into a plan...`);

        const systemPrompt = `You are an expert orchestrator agent. Your role is to decompose a high-level goal into a sequence of concrete sub-tasks for a team of specialized agents.
The available agent types are: 'coder', 'cloud', 'search', 'graphics', 'faq'.
Based on the user's goal, provide a JSON object containing a "plan" key, which holds an array of tasks. Each task must have an 'agentType' and an 'input' object for that agent.
Do not assign tasks to any agent types other than the ones provided.
The output must be only the JSON object, with no other text, explanation, or markdown.`;

        try {
            const response = await deepseekClient.chat.completions.create({
                model: 'deepseek-v4-flash',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Goal: ${input.goal}` },
                ],
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('API returned empty content.');
            }
            const result = JSON.parse(content);
            const plan = result.plan || [];

            console.log(`[${this.name}] Generated plan:`, JSON.stringify(plan, null, 2));

            // Per instructions, do not enqueue these tasks yet. Just return the plan.
            return plan;
        } catch (error) {
            console.error(`[${this.name}] Failed to call DeepSeek API:`, error);
            throw new Error(`Failed to generate plan from LLM: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

--- src/agents/FAQAgent.ts ---
import { Agent } from './Agent';
import { StateManager } from '../state/stateManager';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class FAQAgent implements Agent {
    public readonly id = 'faq-001';
    public readonly name = 'FAQ Agent';

    public async executeTask(stateManager: StateManager, input: { tool: string; args?: object }): Promise<any> {
        const command = process.env.MCP_FAQ_COMMAND;
        const args = process.env.MCP_FAQ_ARGS ? process.env.MCP_FAQ_ARGS.split(' ') : [];
        const cwd = process.env.MCP_FAQ_CWD || process.cwd();

        if (!command) {
            throw new Error('MCP_FAQ_COMMAND environment variable must be set for the FAQ Agent.');
        }

        const transport = new StdioClientTransport({
            command,
            args,
            cwd,
        });

        const client = new Client(
            { name: 'faq-agent-client', version: '1.0.0' },
            { capabilities: {} }
        );

        try {
            await client.connect(transport);
            console.log(`[${this.name}] Connected to FAQ MCP server`);

            const toolName = input.tool || 'faq_business_hours';
            const toolArgs = input.args || {};

            const result = await client.request(
                {
                    method: 'tools/call',
                    params: {
                        name: toolName,
                        arguments: toolArgs,
                    },
                },
                {}
            );

            console.log(`[${this.name}] Tool "${toolName}" called successfully`);
            return result;
        } catch (error) {
            console.error(`[${this.name}] MCP error:`, error);
            throw new Error(`FAQ MCP call failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            await client.close();
        }
    }
}

--- src/agents/agentFactory.ts ---
import { Agent } from './Agent';
import { GreeterAgent } from './GreeterAgent';
import { ManagerAgent } from './ManagerAgent';
import { SummarizerAgent } from './SummarizerAgent';
import { FAQAgent } from './FAQAgent';

/**
 * A simple factory to create agent instances based on type.
 * This can be expanded to support more agent types and complex initializations.
 */

export type AgentType = 'greeter' | 'summarizer' | 'manager' | 'faq';

export function createAgent(type: AgentType): Agent {
    switch (type) {
        case 'greeter':
            return new GreeterAgent();
        case 'summarizer':
            return new SummarizerAgent();
        case 'manager':
            return new ManagerAgent();
        case 'faq':
            return new FAQAgent();
        // Add other agent types here in the future
        // case 'researcher':
        //     return new ResearcherAgent();
        default:
            throw new Error(`Unknown agent type: ${type}`);
    }
}

--- src/runner.ts ---
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

            // If the completed task was a manager agent and returned a plan, enqueue those sub-tasks
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
