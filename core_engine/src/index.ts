// Export core interfaces and classes to be used as a library
export type { Agent } from './agents/Agent';
export type { Task } from './tasks/Task';
export { StateManager } from './state/stateManager';
export { ManagerAgent } from './agents/ManagerAgent';

// Export the singleton instance of the state manager
import stateManager from './state/stateManager';
export default stateManager;
