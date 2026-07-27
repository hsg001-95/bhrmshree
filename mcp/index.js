#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var node_fetch_1 = require("node-fetch");
// The local API port for the Bhrmshree backend engine
var ENGINE_URL = "http://localhost:4005/api";
var server = new index_js_1.Server({
    name: "bhrmshree-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * Define the available tools for the IDE
 */
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                tools: [
                    {
                        name: "bhrmshree_bootstrap",
                        description: "Initialize or check Bhrmshree status in the current project. Must be called before initiating a full DevSecQA scan.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                projectPath: { type: "string", description: "Absolute path of current project root" }
                            },
                            required: ["projectPath"]
                        }
                    },
                    {
                        name: "bhrmshree_trigger_scan",
                        description: "Starts a comprehensive White-Box QA and Security scan using Bhrmshree's AI agents. The target application MUST be running locally first.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                targetUrl: { type: "string", description: "The local URL where the app is running (e.g. http://localhost:3000)" },
                                projectPath: { type: "string", description: "Absolute path of current project root for white-box analysis" }
                            },
                            required: ["targetUrl", "projectPath"]
                        }
                    },
                    {
                        name: "bhrmshree_get_status",
                        description: "Retrieves the real-time progress and findings of the currently running DevSecQA scan.",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    }
                ]
            }];
    });
}); });
/**
 * Handle IDE tool execution
 */
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, targetUrl, projectPath, scanId, res, e_1, res, state, output_1, e_2, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 14, , 15]);
                _a = request.params.name;
                switch (_a) {
                    case "bhrmshree_bootstrap": return [3 /*break*/, 1];
                    case "bhrmshree_trigger_scan": return [3 /*break*/, 4];
                    case "bhrmshree_get_status": return [3 /*break*/, 8];
                }
                return [3 /*break*/, 12];
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(ENGINE_URL, "/state"))];
            case 2:
                _d.sent();
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "✅ Bhrmshree Engine is running on port 4005 and ready for instructions. You can now use `bhrmshree_trigger_scan`."
                            }]
                    }];
            case 3:
                _b = _d.sent();
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "❌ Bhrmshree Engine is NOT running locally. Please ask the user to start it by running `bhrmshree-dashboard.bat` or `npx tsx bhrmshree.ts serve` on port 4005 before you can initiate a scan."
                            }]
                    }];
            case 4:
                _c = request.params.arguments, targetUrl = _c.targetUrl, projectPath = _c.projectPath;
                scanId = "mcp-scan-".concat(Date.now());
                _d.label = 5;
            case 5:
                _d.trys.push([5, 7, , 8]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(ENGINE_URL, "/scan"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ targetUrl: targetUrl, repoDir: projectPath, id: scanId })
                    })];
            case 6:
                res = _d.sent();
                if (!res.ok)
                    throw new Error("HTTP ".concat(res.status));
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "\uD83D\uDE80 DevSecQA Scan successfully initiated!\n\nTarget: ".concat(targetUrl, "\nScan ID: ").concat(scanId, "\nWhite-Box Context: ").concat(projectPath, "\n\nThe Shadow (Security) and Sweeper agents are now mapping and testing the application. Please use `bhrmshree_get_status` periodically to monitor progress, or ask the user to open the visual dashboard at http://localhost:4004.")
                            }]
                    }];
            case 7:
                e_1 = _d.sent();
                return [2 /*return*/, {
                        isError: true,
                        content: [{ type: "text", text: "Failed to trigger scan: ".concat(e_1.message, ". Is the Bhrmshree Engine running on port 4005?") }]
                    }];
            case 8:
                _d.trys.push([8, 11, , 12]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(ENGINE_URL, "/state"))];
            case 9:
                res = _d.sent();
                if (!res.ok)
                    throw new Error("Backend not reachable");
                return [4 /*yield*/, res.json()];
            case 10:
                state = _d.sent();
                if (state.status === "idle") {
                    return [2 /*return*/, {
                            content: [{ type: "text", text: "Bhrmshree is idle. Start a scan with `bhrmshree_trigger_scan`." }]
                        }];
                }
                output_1 = "## Bhrmshree Scan Status: ".concat(state.status.toUpperCase(), "\n");
                output_1 += "Target: ".concat(state.targetUrl, "\n\n");
                // Phases
                Object.values(state.phases || {}).forEach(function (p) {
                    output_1 += "### Phase: ".concat(p.phase.toUpperCase(), " [").concat(p.status, "]\n");
                    output_1 += "- Progress: ".concat(p.completed, " / ").concat(p.totalTests, " tests\n");
                    output_1 += "- Passing/Safe: ".concat(p.passCount, "\n");
                    output_1 += "- Failing/Vulnerable: ".concat(p.failCount, "\n\n");
                });
                // Top findings
                if (state.findings && state.findings.length > 0) {
                    output_1 += "### Discovered Vulnerabilities & Bugs\n";
                    state.findings.forEach(function (f, i) {
                        output_1 += "".concat(i + 1, ". **[").concat(f.severity, "]** ").concat(f.title, "\n   ").concat(f.description, "\n");
                    });
                }
                output_1 += "\n*For visual video execution and complete reports, open the local dashboard at http://localhost:4004*";
                return [2 /*return*/, { content: [{ type: "text", text: output_1 }] }];
            case 11:
                e_2 = _d.sent();
                return [2 /*return*/, {
                        isError: true,
                        content: [{ type: "text", text: "Failed to fetch status: ".concat(e_2.message) }]
                    }];
            case 12: throw new Error("Unknown tool");
            case 13: return [3 /*break*/, 15];
            case 14:
                error_1 = _d.sent();
                return [2 /*return*/, {
                        isError: true,
                        content: [{ type: "text", text: "Error: ".concat(error_1.message) }]
                    }];
            case 15: return [2 /*return*/];
        }
    });
}); });
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Bhrmshree MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error("Fatal error in MCP server:", err);
    process.exit(1);
});
