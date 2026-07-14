// src/agents/CoderAgent.ts

import fs from 'fs';
import path from 'path';
import { Agent } from './Agent';
import { StateManager } from '../state/stateManager';

/**
 * CoderAgent — takes a coding sub-task, sends it to DeepSeek, writes the
 * proposed code to a local scratchpad folder for review.
 *
 * Scratchpad-only by design: no MCP client, no git, no GitHub, no file
 * writes outside its own scratchpad directory. Nothing here executes code
 * or touches a real repo.
 */

const SCRATCHPAD_DIR = path.resolve(__dirname, '../../scratchpad/coder');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL_GRUNT = 'deepseek-v4-flash';
const MODEL_HEAVY = 'deepseek-v4-pro';

export class CoderAgent implements Agent {
    readonly id = 'coder-agent';
    readonly name = 'CoderAgent';

    async executeTask(stateManager: StateManager, input?: any): Promise<any> {
         const question: string = typeof input === 'string' ? input : (input?.question ?? input?.task ?? 'No task specified.');
        const context: string | undefined = input?.context;
        const complex: boolean = !!input?.complex;

        if (!fs.existsSync(SCRATCHPAD_DIR)) {
            fs.mkdirSync(SCRATCHPAD_DIR, { recursive: true });
        }

        const model = complex ? MODEL_HEAVY : MODEL_GRUNT;

        const systemPrompt =
            'You are a precise coding assistant. Given a task and optional context, ' +
            'return ONLY the proposed code or diff, no prose explanation before or after.';

        const userPrompt = context
            ? `Task: ${question}\n\nContext:\n${context}`
            : `Task: ${question}`;

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepSeek call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content ?? '(no output returned)';

        const taskId = input?.id ?? `task-${Date.now()}`;
        const outputPath = path.join(SCRATCHPAD_DIR, `${taskId}.txt`);
        fs.writeFileSync(outputPath, output, 'utf-8');

        return {
            taskId,
            outputPath,
            summary: `Proposed code written to ${outputPath}. Review before applying anywhere.`,
        };
    }
}
