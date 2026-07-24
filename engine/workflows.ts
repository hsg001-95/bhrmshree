import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities.ts';
import type { BhrmshreeTask, PipelineState } from '../shared/types.ts';

const { 
  runSecurityProbeActivity, 
  runFinalAssuranceActivity,
  generateReportActivity 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 hours',
});

/**
 * Bhrmshree Unified Workflow:
 * 1. Security Probe (Shadow Agent)
 * 2. Final Assurance (Blind Scan)
 * 3. Reporting
 */
export async function bhrmshreeWorkflow(task: BhrmshreeTask): Promise<PipelineState> {
  const state: PipelineState = {
    status: 'RUNNING',
    currentPhase: 'SECURITY_PROBE',
    discoveredEndpoints: [],
    vulnerabilities: [],
    bugs: [],
  };

  try {
    // Generate initial target blueprint (previously done by Explorer)
    const blueprint = {
      targets: [
        { location: task.targetUrl, type: 'main_page' },
        { location: `${task.targetUrl}/login`, type: 'auth_form' },
        { location: `${task.targetUrl}/api`, type: 'api_endpoint' },
      ],
    };

    // Phase 1: Security Probe (Hacking)
    const securityResult = await runSecurityProbeActivity(task, blueprint);
    
    // Phase 2: Final Assurance (Blind Scan)
    // Runs AI-driven hyper-guessing for hidden endpoints
    const assuranceResult = await runFinalAssuranceActivity(task, blueprint);
    
    // Update findings from all phases
    state.vulnerabilities = [
      ...securityResult.findings.filter(f => f.type === 'VULNERABILITY'),
      ...assuranceResult.findings.filter(f => f.type === 'VULNERABILITY')
    ];
    state.bugs = []; // No bugs since explorer/discovery phase is removed

    // Phase 3: Reporting
    state.currentPhase = 'REPORTING';
    await generateReportActivity([securityResult, assuranceResult]);

    state.status = 'COMPLETED';
    return state;
  } catch (error) {
    state.status = 'FAILED';
    throw error;
  }
}

