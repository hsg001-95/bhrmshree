"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowAgent = void 0;
const llm_provider_js_1 = require("../llm-provider.js");
const browser_ts_1 = require("../automation/browser.ts");
const types_ts_1 = require("../../shared/types.ts");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * The Shadow Agent (Security Specialist).
 * Responsible for identifying and exploiting vulnerabilities in the application workflow.
 */
class ShadowAgent {
    llm;
    browser;
    constructor(apiKey) {
        this.llm = new llm_provider_js_1.LlmProvider(apiKey);
        this.browser = new browser_ts_1.BhrmshreeBrowser();
    }
    /**
     * Execute the Security Probe phase using the discoveries from the Explorer.
     * @param task The task details.
     * @param blueprint The functional map discovered by the Explorer agent.
     */
    async probe(task, blueprint) {
        const startTime = Date.now();
        const findings = [];
        try {
            await this.browser.start(true);
            // Load the Shadow Master Prompt
            const promptTemplate = await promises_1.default.readFile(path_1.default.join(process.cwd(), 'prompts/security/shadow.txt'), 'utf8');
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
                    const response = await this.llm.runPrompt(prompt);
                    const action = this.parseAction(response);
                    if (action.type === 'FINISH')
                        break;
                    if (action.type === 'REPORT_VULNERABILITY') {
                        findings.push(action.payload);
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
        }
        catch (error) {
            await this.browser.stop();
            throw error;
        }
    }
    parseAction(response) {
        try {
            return JSON.parse(response);
        }
        catch {
            return { type: 'FINISH', reason: 'Failed to parse Shadow action' };
        }
    }
    async executeAttackAction(action) {
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
exports.ShadowAgent = ShadowAgent;
//# sourceMappingURL=shadow.js.map