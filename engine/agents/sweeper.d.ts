import { BhrmshreeTask, AgentResult } from '../../shared/types.ts';
/**
 * The Sweeper Agent (Final Assurance).
 * Performs AI-Driven Hyper-Guessing for hidden files and directories.
 */
export declare class SweeperAgent {
    private browser;
    private llm;
    constructor(apiKey: string);
    /**
     * Generate a massive list of hyper-contextual paths using AI.
     */
    private generateGuessList;
    sweep(task: BhrmshreeTask, blueprint: any): Promise<AgentResult>;
}
//# sourceMappingURL=sweeper.d.ts.map