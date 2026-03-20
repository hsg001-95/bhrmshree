import { BhrmshreeTask, AgentResult } from '../shared/types.js';
/**
 * Activities are the individual "building blocks" of the Bhrmshree pipeline.
 * Temporal ensures these tasks are reliable and can be retried if the browser crashes.
 */
export declare function runDiscoveryActivity(task: BhrmshreeTask): Promise<AgentResult>;
export declare function runSecurityProbeActivity(task: BhrmshreeTask, blueprint: any): Promise<AgentResult>;
export declare function runFinalAssuranceActivity(task: BhrmshreeTask, blueprint: any): Promise<AgentResult>;
export declare function generateReportActivity(results: AgentResult[]): Promise<string>;
//# sourceMappingURL=activities.d.ts.map