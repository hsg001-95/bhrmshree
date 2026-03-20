import { ExplorerAgent } from './agents/explorer.ts';
import { ShadowAgent } from './agents/shadow.ts';
import { SweeperAgent } from './agents/sweeper.ts';
import type { BhrmshreeTask, AgentResult } from '../shared/types.ts';

/**
 * Activities are the individual "building blocks" of the Bhrmshree pipeline.
 * Temporal ensures these tasks are reliable and can be retried if the browser crashes.
 */

export async function runDiscoveryActivity(task: BhrmshreeTask): Promise<AgentResult> {
  const explorer = new ExplorerAgent(process.env.GOOGLE_AI_API_KEY || '');
  console.log(`[Activity] Starting Discovery for ${task.targetUrl}`);
  return await explorer.discover(task);
}

export async function runSecurityProbeActivity(task: BhrmshreeTask, blueprint: any): Promise<AgentResult> {
  const shadow = new ShadowAgent(process.env.GOOGLE_AI_API_KEY || '');
  console.log(`[Activity] Starting Security Probe for ${task.targetUrl}`);
  return await shadow.probe(task, blueprint);
}

export async function runFinalAssuranceActivity(task: BhrmshreeTask, blueprint: any): Promise<AgentResult> {
  const sweeper = new SweeperAgent(process.env.GOOGLE_AI_API_KEY || '');
  console.log(`[Activity] Starting AI-Driven Final Assurance for ${task.targetUrl}`);
  return await sweeper.sweep(task, blueprint);
}

export async function generateReportActivity(results: AgentResult[]): Promise<string> {
  // Simple report generator logic
  return JSON.stringify(results, null, 2);
}
