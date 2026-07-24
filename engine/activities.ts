import { ShadowAgent } from './agents/shadow.ts';
import { SweeperAgent } from './agents/sweeper.ts';
import type { BhrmshreeTask, AgentResult } from '../shared/types.ts';
import fs from 'fs/promises';
import path from 'path';

/**
 * Activities are the individual "building blocks" of the Bhrmshree pipeline.
 * Temporal ensures these tasks are reliable and can be retried if the browser crashes.
 */

export async function runSecurityProbeActivity(task: BhrmshreeTask, blueprint: any): Promise<AgentResult> {
  const shadow = new ShadowAgent();
  console.log(`[Activity] Starting Security Probe for ${task.targetUrl}`);
  return await shadow.probe(task, blueprint);
}

export async function runFinalAssuranceActivity(task: BhrmshreeTask, blueprint: any): Promise<AgentResult> {
  const sweeper = new SweeperAgent();
  console.log(`[Activity] Starting AI-Driven Final Assurance for ${task.targetUrl}`);
  return await sweeper.sweep(task, blueprint);
}

export async function generateReportActivity(results: AgentResult[]): Promise<string> {
  // Simple report generator logic
  return JSON.stringify(results, null, 2);
}

