import { LlmProvider } from '../llm-provider.ts';
import { BhrmshreeBrowser } from '../automation/browser.ts';
import type { BhrmshreeTask, AgentResult, Finding } from '../../shared/types.ts';
import fs from 'fs/promises';
import path from 'path';

/**
 * The Explorer Agent (QA Specialist).
 * Responsible for discovering the application's functional map and "Happy Paths".
 */
export class ExplorerAgent {
  private llm: LlmProvider;
  private browser: BhrmshreeBrowser;

  constructor(apiKey: string) {
    this.llm = new LlmProvider(apiKey);
    this.browser = new BhrmshreeBrowser();
  }

  /**
   * Step 1: Analyze the target and codebase to generate a dedicated QA test plan.
   */
  async generateTestPlan(task: BhrmshreeTask): Promise<{ id: string, name: string, description: string, severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', steps: any[] }[]> {
    const prompt = `
# ROLE: Bhrmshree Explorer Agent (QA Test Planner)

You are a world-class Quality Assurance automation engineer. Your mission is to generate a comprehensive end-to-end "Happy Path" test suite for a web application.

## CURRENT CONTEXT
Target URL: ${task.targetUrl}

## SOURCE CODE REPOSITORY (White-Box context)
${task.context || 'No local repository provided. Rely on standard web patterns.'}

## INSTRUCTIONS
Based on the provided URL and source code above, deduce the primary functional flows of the application. 
Generate a list of exactly 3 to 7 automated test cases that will thoroughly verify this application works.
Focus on features like Login, Registration, Data Submission, Dashboard Navigation, Settings, etc.

Return ONLY a JSON array, where each object has:
- "id": A unique string id like "test-login"
- "name": Human readable name
- "description": Brief purpose of the test
- "severity": "MEDIUM" or "HIGH" or "CRITICAL"
- "steps": An array of Playwright-style steps to execute. Valid step types are "NAVIGATE" (payload: url), "CLICK" (selector: CSS), "TYPE" (selector: CSS, payload: text).

Example:
[
  {
    "id": "qa-login",
    "name": "User Authentication Flow",
    "description": "Verify that a user can successfully login with standard credentials.",
    "severity": "CRITICAL",
    "steps": [
      { "type": "NAVIGATE", "payload": "${task.targetUrl}/login" },
      { "type": "TYPE", "selector": "input[type='email']", "payload": "test@test.com" },
      { "type": "TYPE", "selector": "input[type='password']", "payload": "password123" },
      { "type": "CLICK", "selector": "button[type='submit']" }
    ]
  }
]

ONLY RETURN THE JSON ARRAY. NO MARKDOWN FORMATTING OR BACKTICKS.
`;

    try {
      const response = await this.llm.runPrompt(prompt);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e: any) {
      console.log(`[Explorer] Failed to parse dynamic test plan: ${e.message}`);
      // Fallback simple test
      return [
        {
          id: 'qa-homepage-load',
          name: 'Core Application Render',
          description: 'Verify the application index page loads and renders without immediate crashes.',
          severity: 'CRITICAL',
          steps: [
            { type: 'NAVIGATE', payload: task.targetUrl }
          ]
        }
      ];
    }
  }

  /**
   * Step 2: Execute a specific test plan within an isolated context and record a video.
   */
  async executeTest(targetUrl: string, testPlan: any, outputVideoPath: string): Promise<{ success: boolean; error?: string }> {
    return await this.browser.runTestWithVideo(targetUrl, testPlan.steps, outputVideoPath);
  }
}
