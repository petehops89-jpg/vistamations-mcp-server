// src/config.ts

import * as dotenv from 'dotenv';

// Load environment variables from a .env file if it exists
dotenv.config();

/**
 * Defines the structure for the application's configuration.
 * Best practice is to load sensitive data (like API keys) from environment variables.
 */
export interface AppConfig {
    appName: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    // Example for a future API key
    // apiKey: string | undefined;
}

const config: AppConfig = {
    appName: process.env.APP_NAME || 'MCP_Agent_Platform',
    logLevel: (process.env.LOG_LEVEL as AppConfig['logLevel']) || 'info',
    // apiKey: process.env.API_KEY,
};

/**
 * Validates the configuration to ensure critical values are present.
 */
function validateConfig(cfg: AppConfig): void {
    // Example validation:
    // if (!cfg.apiKey) {
    //     throw new Error("API_KEY is not defined in environment variables. Please create a .env file and add it.");
    // }
}

validateConfig(config);

export default config;
