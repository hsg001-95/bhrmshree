"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorerAgent = void 0;
const llm_provider_js_1 = require("../llm-provider.js");
const browser_ts_1 = require("../automation/browser.ts");
const types_ts_1 = require("../../shared/types.ts");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * The Explorer Agent (QA Specialist).
 * Responsible for discovering the application's functional map and "Happy Paths".
 */
class ExplorerAgent {
    llm;
    browser;
    constructor(apiKey) {
        this.llm = new llm_provider_js_1.LlmProvider(apiKey);
        this.browser = new browser_ts_1.BhrmshreeBrowser();
    }
    /**
     * Execute the Discovery phase for a given task.
     */
    async discover(task) {
        const startTime = Date.now();
        const findings = [];
        const discoveredEndpoints = [];
        try {
            // 1. Initialize the "Eyes" (Browser)
            await this.browser.start(true); // Headless for efficiency
            await this.browser.navigate(task.targetUrl);
            // 2. Load the Master Prompt
            const promptTemplate = await promises_1.default.readFile(path_1.default.join(process.cwd(), 'prompts/qa/explorer.txt'), 'utf8');
            // 3. Initial "Vision" - Get the first snapshot of the page
            const { screenshot, accessibilityTree } = await this.browser.getSnapshot();
            // 4. Agentic Loop - Systematic Exploration
            // For this initial implementation, we'll perform a multi-turn reasoning loop
            let currentContext = `Target URL: ${task.targetUrl}\nInitial Accessibility Tree: ${JSON.stringify(accessibilityTree, null, 2)}`;
            for (let turn = 1; turn <= 10; turn++) {
                const prompt = promptTemplate
                    .replace('{{CONTEXT}}', currentContext)
                    .replace('{{TURN}}', turn.toString());
                const actionResponse = await this.llm.runPrompt(prompt);
                // Parse the AI's intended action (e.g., CLICK, TYPE, NAVIGATE, FINISH)
                const action = this.parseAction(actionResponse);
                if (action.type === 'FINISH')
                    break;
                await this.executeAction(action);
                // Update context with new state
                const nextSnapshot = await this.browser.getSnapshot();
                currentContext = `Action Taken: ${JSON.stringify(action)}\nNew State: ${JSON.stringify(nextSnapshot.accessibilityTree, null, 2)}`;
                // Log discovered endpoints or features
                if (action.type === 'NAVIGATE')
                    discoveredEndpoints.push(action.payload);
            }
            await this.browser.stop();
            return {
                taskId: task.id,
                success: true,
                findings,
                metrics: {
                    durationMs: Date.now() - startTime,
                    tokensUsed: 0, // TODO: Track tokens from Gemini response
                    costUsd: 0,
                },
            };
        }
        catch (error) {
            await this.browser.stop();
            throw error;
        }
    }
    parseAction(response) {
        try {
            // Expecting JSON format from the prompt instructions
            return JSON.parse(response);
        }
        catch {
            // Fallback for non-JSON responses
            return { type: 'FINISH', reason: 'Failed to parse AI action' };
        }
    }
    async executeAction(action) {
        switch (action.type) {
            case 'CLICK':
                await this.browser.click(action.selector);
                break;
            case 'TYPE':
                await this.browser.type(action.selector, action.payload);
                break;
            case 'NAVIGATE':
                await this.browser.navigate(action.payload);
                break;
        }
    }
}
exports.ExplorerAgent = ExplorerAgent;
//# sourceMappingURL=explorer.js.map