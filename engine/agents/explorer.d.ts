import { BhrmshreeTask, AgentResult } from '../../shared/types.ts';
/**
 * The Explorer Agent (QA Specialist).
 * Responsible for discovering the application's functional map and "Happy Paths".
 */
export declare class ExplorerAgent {
    private llm;
    private browser;
    constructor(apiKey: string);
    /**
     * Execute the Discovery phase for a given task.
     */
    discover(task: BhrmshreeTask): Promise<AgentResult>;
    private parseAction;
    private executeAction;
}
//# sourceMappingURL=explorer.d.ts.map