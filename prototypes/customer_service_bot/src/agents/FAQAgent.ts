import { Agent, StateManager } from 'core_engine';
import * as fs from 'fs';
import * as path from 'path';

interface FaqEntry {
    question: string;
    answer: string;
}

interface FaqDatabase {
    [question: string]: string;
}

/**
 * An agent that answers frequently asked questions loaded from a persistent knowledge base.
 */
export class FAQAgent implements Agent {
    public readonly id = 'cs-faq-001';
    public readonly name = 'CS FAQ Agent';

    private knowledgeBase: FaqDatabase = {};
    private readonly kbPath: string;

    constructor() {
        this.kbPath = path.join(__dirname, '..', '..', 'data', 'faq_kb.json');
        this.loadKnowledgeBase();
    }

    private loadKnowledgeBase(): void {
        try {
            const rawData = fs.readFileSync(this.kbPath, 'utf8');
            const faqEntries: FaqEntry[] = JSON.parse(rawData);
            this.knowledgeBase = faqEntries.reduce((acc, entry) => {
                acc[entry.question.toLowerCase()] = entry.answer;
                return acc;
            }, {} as FaqDatabase);
            console.log(`[${this.name}] Knowledge base loaded from ${this.kbPath}`);
        } catch (error) {
            console.error(`[${this.name}] Failed to load knowledge base from ${this.kbPath}:`, error);
        }
    }

    public async executeTask(stateManager: StateManager, input: { question: string }): Promise<string> {
        const question = input.question.toLowerCase();
        const answer = this.knowledgeBase[question] || "I'm sorry, I don't have an answer to that question. Please rephrase or ask something else.";

        console.log(`[${this.name}] answering question: "${input.question}"`);
        console.log(`[${this.name}] says: ${answer}`);
        
        return answer;
    }
}
