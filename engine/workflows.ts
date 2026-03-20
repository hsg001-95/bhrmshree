import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities.ts';
import type { BhrmshreeTask, PipelineState } from '../shared/types.ts';

const { 
  runDiscoveryActivity, 
  runSecurityProbeActivity, 
  runFinalAssuranceActivity,
  generateReportActivity 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 hours',
});

/**
 * Bhrmshree Unified Workflow:
 * 1. Discovery (QA Explorer Agent)
 * 2. Security Probe (Shadow Agent)
 * 3. Final Assurance (Blind Scan)
 * 4. Reporting
 */
export async function bhrmshreeWorkflow(task: BhrmshreeTask): Promise<PipelineState> {
  const state: PipelineState = {
    status: 'RUNNING',
    currentPhase: 'DISCOVERY',
    discoveredEndpoints: [],
    vulnerabilities: [],
    bugs: [],
  };

  try {
    // Phase 1: Discovery (QA)
    const discoveryResult = await runDiscoveryActivity(task);
    
    // Phase 2: Security Probe (Hacking)
    state.currentPhase = 'SECURITY_PROBE';
    const securityResult = await runSecurityProbeActivity(task, discoveryResult);
    
    // Phase 3: Final Assurance (Blind Scan)
    // Runs AI-driven hyper-guessing for hidden endpoints
    const assuranceResult = await runFinalAssuranceActivity(task, discoveryResult);
    
    // Update findings from all phases
    state.vulnerabilities = [
      ...securityResult.findings.filter(f => f.type === 'VULNERABILITY'),
      ...assuranceResult.findings.filter(f => f.type === 'VULNERABILITY')
    ];
    state.bugs = discoveryResult.findings.filter(f => f.type === 'BUG');

    // Phase 4: Reporting
    state.currentPhase = 'REPORTING';
    await generateReportActivity([discoveryResult, securityResult, assuranceResult]);

    state.status = 'COMPLETED';
    return state;
  } catch (error) {
    state.status = 'FAILED';
    throw error;
  }
}
