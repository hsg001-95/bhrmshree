import { LlmProvider } from '../llm-provider.ts';
import { BhrmshreeBrowser } from '../automation/browser.ts';
import type { BhrmshreeTask, AgentResult, Finding } from '../../shared/types.ts';

/**
 * The Sweeper Agent (Final Assurance).
 * Performs AI-Driven Hyper-Guessing for hidden files and directories.
 */
export class SweeperAgent {
  private browser: BhrmshreeBrowser;
  private llm: LlmProvider;

  constructor() {
    this.browser = new BhrmshreeBrowser();
    this.llm = new LlmProvider();
  }

  /**
   * Generate a massive list of hyper-contextual paths using AI.
   */
  private async generateGuessList(task: BhrmshreeTask, blueprint: any): Promise<string[]> {
    const prompt = `
      You are a world-class security researcher specialized in directory brute-forcing.
      Based on the following application blueprint, generate a list of 50 highly probable hidden paths, files, or API endpoints.

      TARGET URL: ${task.targetUrl}
      DISCOVERED TECH: ${JSON.stringify(blueprint.techStack || 'unknown')}

      Focus on:
      - Configuration files (.env, .yaml, .json)
      - Development artifacts (.git, .vscode, .idea)
      - Framework-specific paths (Next.js, Express, React)
      - Sensitive endpoints (/admin, /debug, /metrics, /backup)
      - Secret keys or credentials files

      Output ONLY a comma-separated list of paths starting with /.
    `;

    const response = await this.llm.runPrompt(prompt, 'gemini', 'gemini-1.5-flash');
    return response.split(',').map(p => p.trim()).filter(p => p.startsWith('/'));
  }

  async sweep(task: BhrmshreeTask, blueprint: any): Promise<AgentResult> {
    const startTime = Date.now();
    const findings: Finding[] = [];

    try {
      const aiPaths = await this.generateGuessList(task, blueprint);
      console.log(`[Sweeper] AI Generated ${aiPaths.length} hyper-contextual paths for probing.`);

      await this.browser.start(true);
      const baseUrl = new URL(task.targetUrl).origin;

      for (const path of aiPaths) {
        // Construct target url
        const targetUrl = `${baseUrl}${path}`;
        const { durationMs } = await this.browser.navigate(targetUrl);
        
        // Simple heuristic: If we get something other than a 404, or the content looks sensitive
        const snapshot = await this.browser.getSnapshot();
        
        // Check for common indicators of a successful "find"
        const isExposed = snapshot.consoleLogs.some(log => log.includes('forbidden') || log.includes('error')) || 
                          snapshot.clientState.windowVars.length > 0;

        // In a real implementation, we would check HTTP status codes. 
        // For now, we use the "eyes" of the browser to see if the page looks like a directory or sensitive file.
        if (snapshot.accessibilityTree && snapshot.accessibilityTree.name !== '404 Not Found') {
           findings.push({
             type: 'VULNERABILITY',
             severity: 'HIGH',
             title: `Exposed Hidden Path: ${path}`,
             description: `The path ${path} is accessible and may contain sensitive information.`,
             reproSteps: [`Navigate to ${targetUrl}`],
             location: targetUrl
           });
           console.log(`[Sweeper] 🔥 POTENTIAL EXPOSURE FOUND: ${path}`);
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
}
