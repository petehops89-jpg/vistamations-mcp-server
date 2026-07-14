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
