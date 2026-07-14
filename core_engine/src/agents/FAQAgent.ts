import { Agent } from './Agent';
import { StateManager } from '../state/stateManager';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

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
                CallToolResultSchema
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
