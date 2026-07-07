import { Agent } from './Agent';
import { StateManager } from '../state/stateManager';

/**
 * A simple agent that "summarizes" a given text by returning the first sentence.
 */
export class SummarizerAgent implements Agent {
    public readonly id = 'summarizer-001';
    public readonly name = 'Summarizer Agent';

    public async executeTask(stateManager: StateManager, input: { text: string }): Promise<string> {
        // This agent does not need to interact with the state manager, but it must conform to the interface.
        if (!input?.text || typeof input.text !== 'string' || input.text.length === 0) {
            throw new Error('Input text is missing or invalid.');
        }

        console.log(`[${this.name}] received text to summarize.`);
        
        // A simple summarization logic: return the first sentence.
        const sentences = input.text.split(/[.!?]/);
        const summary = sentences[0].trim() + '.';

        console.log(`[${this.name}] produced summary: "${summary}"`);
        
        return summary;
    }
}
