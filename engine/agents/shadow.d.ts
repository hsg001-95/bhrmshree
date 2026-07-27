import { BhrmshreeTask, AgentResult } from '../../shared/types.ts';
/**
 * The Shadow Agent (Security Specialist).
 * Responsible for identifying and exploiting vulnerabilities in the application workflow.
 */
export declare class ShadowAgent {
    private llm;
    private browser;
    constructor(apiKey: string);
    /**
     * Execute the Security Probe phase using the discoveries from the Explorer.
     * @param task The task details.
     * @param blueprint The functional map discovered by the Explorer agent.
     */
    probe(task: BhrmshreeTask, blueprint: any): Promise<AgentResult>;
    private parseAction;
    private executeAttackAction;
}
//# sourceMappingURL=shadow.d.ts.map