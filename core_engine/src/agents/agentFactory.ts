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
