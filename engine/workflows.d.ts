import { BhrmshreeTask, PipelineState } from '../shared/types.js';
/**
 * Bhrmshree Unified Workflow:
 * 1. Discovery (QA Explorer Agent)
 * 2. Security Probe (Shadow Agent)
 * 3. Final Assurance (Blind Scan)
 * 4. Reporting
 */
export declare function bhrmshreeWorkflow(task: BhrmshreeTask): Promise<PipelineState>;
//# sourceMappingURL=workflows.d.ts.map