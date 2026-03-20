"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDiscoveryActivity = runDiscoveryActivity;
exports.runSecurityProbeActivity = runSecurityProbeActivity;
exports.runFinalAssuranceActivity = runFinalAssuranceActivity;
exports.generateReportActivity = generateReportActivity;
const explorer_js_1 = require("./agents/explorer.js");
const shadow_js_1 = require("./agents/shadow.js");
const sweeper_js_1 = require("./agents/sweeper.js");
const types_js_1 = require("../shared/types.js");
/**
 * Activities are the individual "building blocks" of the Bhrmshree pipeline.
 * Temporal ensures these tasks are reliable and can be retried if the browser crashes.
 */
async function runDiscoveryActivity(task) {
    const explorer = new explorer_js_1.ExplorerAgent(process.env.GOOGLE_AI_API_KEY || '');
    console.log(`[Activity] Starting Discovery for ${task.targetUrl}`);
    return await explorer.discover(task);
}
async function runSecurityProbeActivity(task, blueprint) {
    const shadow = new shadow_js_1.ShadowAgent(process.env.GOOGLE_AI_API_KEY || '');
    console.log(`[Activity] Starting Security Probe for ${task.targetUrl}`);
    return await shadow.probe(task, blueprint);
}
async function runFinalAssuranceActivity(task, blueprint) {
    const sweeper = new sweeper_js_1.SweeperAgent(process.env.GOOGLE_AI_API_KEY || '');
    console.log(`[Activity] Starting AI-Driven Final Assurance for ${task.targetUrl}`);
    return await sweeper.sweep(task, blueprint);
}
async function generateReportActivity(results) {
    // Simple report generator logic
    return JSON.stringify(results, null, 2);
}
//# sourceMappingURL=activities.js.map