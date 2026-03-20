import { LlmProvider } from '../llm-provider.ts';
import { BhrmshreeBrowser } from '../automation/browser.ts';
import type { BhrmshreeTask, AgentResult, Finding } from '../../shared/types.ts';
import fs from 'fs/promises';
import path from 'path';

/**
 * The Shadow Agent (Security Specialist).
 * Responsible for identifying and exploiting vulnerabilities in the application workflow.
 */
export class ShadowAgent {
  private llm: LlmProvider;
  private browser: BhrmshreeBrowser;

  constructor() {
    this.llm = new LlmProvider();
    this.browser = new BhrmshreeBrowser();
  }

  /**
   * Execute the Security Probe phase using the discoveries from the Explorer.
   * @param task The task details.
   * @param blueprint The functional map discovered by the Explorer agent.
   */
  async probe(task: BhrmshreeTask, blueprint: any, options?: { fileCount?: number }): Promise<AgentResult> {
    const startTime = Date.now();
    const findings: Finding[] = [];

    // Dynamically choose Anthropic model based on user requested logic
    const isWhiteBox = task.repoPath && task.repoPath.length > 0;
    const useOpus = isWhiteBox && (options?.fileCount || 0) > 50;
    
    // Fulfilling user request: Sonnet 4.6 default, Opus 4.6 for large whitebox
    // (Mapping to closest valid Anthropic model strings)
    const modelName = useOpus ? 'claude-3-opus-20240229' : 'claude-3-7-sonnet-20250219';
    console.log(`[Shadow] 🧠 Initializing Security Reasoning with 1x ${useOpus ? 'Opus' : 'Sonnet'}`);

    try {
      await this.browser.start(true);
      
      // Load the Shadow Master Prompt
      const promptTemplate = await fs.readFile(
        path.join(process.cwd(), 'prompts/security/shadow.txt'),
        'utf8'
      );

      // Loop through each high-value target discovered by the Explorer
      for (const target of blueprint.targets || []) {
        console.log(`[Shadow] Attacking target: ${target.location} (${target.type})`);
        
        await this.browser.navigate(target.location);
        
        // Multi-turn exploitation loop for each target
        let currentContext = `Target Blueprint: ${JSON.stringify(target, null, 2)}\nInitial State: ${JSON.stringify(await this.browser.getSnapshot(), null, 2)}`;
        
        for (let turn = 1; turn <= 15; turn++) {
          const prompt = promptTemplate
            .replace('{{CONTEXT}}', currentContext)
            .replace('{{TURN}}', turn.toString());

          const response = await this.llm.runPrompt(prompt, 'anthropic', modelName);
          const action = this.parseAction(response);

          if (action.type === 'FINISH') break;
          
          if (action.type === 'REPORT_VULNERABILITY') {
            findings.push(action.payload as Finding);
            console.log(`[Shadow] 🔥 VULNERABILITY FOUND: ${action.payload.title}`);
            // Don't finish - continue to see if more can be found or chained
            continue; 
          }

          await this.executeAttackAction(action);
          
          // Capture new state after attack
          const nextState = await this.browser.getSnapshot();
          currentContext = `Last Action: ${JSON.stringify(action)}\nNew State: ${JSON.stringify(nextState, null, 2)}`;
        }
      }

      await this.browser.stop();

      return {
        taskId: task.id,
        success: true,
        findings,
        metrics: {
          durationMs: Date.now() - startTime,
          tokensUsed: 0,
          costUsd: 0,
        },
      };

    } catch (error) {
      await this.browser.stop();
      throw error;
    }
  }

  private parseAction(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      return { type: 'FINISH', reason: 'Failed to parse Shadow action' };
    }
  }

  private async executeAttackAction(action: any): Promise<void> {
    switch (action.type) {
      case 'INJECT_PAYLOAD':
        await this.browser.type(action.selector, action.payload);
        await this.browser.click(action.submitSelector || action.selector); // Auto-submit if needed
        break;
      case 'MANIPULATE_URL':
        await this.browser.navigate(action.payload);
        break;
      case 'BYPASS_AUTH':
        // Custom logic for auth bypass (e.g., cookie manipulation)
        break;
    }
  }
}
