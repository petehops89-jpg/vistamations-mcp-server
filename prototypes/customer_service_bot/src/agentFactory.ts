import { Agent } from 'core_engine';
import { GreetingAgent } from './agents/GreetingAgent';
import { FAQAgent } from './agents/FAQAgent';

/**
 * Defines the types of agents available in this specific prototype.
 */
export type CSAgentType = 'greeting' | 'faq';

/**
 * A local factory for the Customer Service Bot prototype.
 * It creates agents specific to this prototype's domain.
 */
export function createCSAgent(type: CSAgentType): Agent {
    switch (type) {
        case 'greeting':
            return new GreetingAgent();
        case 'faq':
            return new FAQAgent();
        default:
            // This is a safeguard; TypeScript should prevent this case.
            throw new Error(`Unknown customer service agent type: ${type}`);
    }
}
