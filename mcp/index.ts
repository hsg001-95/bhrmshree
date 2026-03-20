#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// The local API port for the Bhrmshree backend engine
const ENGINE_URL = "http://localhost:4005/api";

const server = new Server(
  {
    name: "bhrmshree-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Define the available tools for the IDE
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
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
  };
});

/**
 * Handle IDE tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "bhrmshree_bootstrap": {
        // Ping local engine to ensure it's alive
        try {
          await fetch(`${ENGINE_URL}/state`);
          return {
            content: [{
              type: "text",
              text: "✅ Bhrmshree Engine is running on port 4005 and ready for instructions. You can now use `bhrmshree_trigger_scan`."
            }]
          };
        } catch {
          return {
            content: [{
              type: "text",
              text: "❌ Bhrmshree Engine is NOT running locally. Please ask the user to start it by running `bhrmshree-dashboard.bat` or `npx tsx bhrmshree.ts serve` on port 4005 before you can initiate a scan."
            }]
          };
        }
      }

      case "bhrmshree_trigger_scan": {
        const { targetUrl, projectPath } = request.params.arguments as any;
        const scanId = `mcp-scan-${Date.now()}`;
        
        try {
          const res = await fetch(`${ENGINE_URL}/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUrl, repoDir: projectPath, id: scanId })
          });
          
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          return {
            content: [{
              type: "text",
              text: `🚀 DevSecQA Scan successfully initiated!\n\nTarget: ${targetUrl}\nScan ID: ${scanId}\nWhite-Box Context: ${projectPath}\n\nThe Explorer (QA), Shadow (Security), and Sweeper agents are now mapping and testing the application. Please use \`bhrmshree_get_status\` periodically to monitor progress, or ask the user to open the visual dashboard at http://localhost:4004.`
            }]
          };
        } catch (e: any) {
          return {
            isError: true,
            content: [{ type: "text", text: `Failed to trigger scan: ${e.message}. Is the Bhrmshree Engine running on port 4005?` }]
          };
        }
      }

      case "bhrmshree_get_status": {
        try {
          const res = await fetch(`${ENGINE_URL}/state`);
          if (!res.ok) throw new Error("Backend not reachable");
          
          const state = await res.json() as any;
          if (state.status === "idle") {
            return {
              content: [{ type: "text", text: "Bhrmshree is idle. Start a scan with `bhrmshree_trigger_scan`." }]
            };
          }

          let output = `## Bhrmshree Scan Status: ${state.status.toUpperCase()}\n`;
          output += `Target: ${state.targetUrl}\n\n`;

          // Phases
          Object.values(state.phases || {}).forEach((p: any) => {
            output += `### Phase: ${p.phase.toUpperCase()} [${p.status}]\n`;
            output += `- Progress: ${p.completed} / ${p.totalTests} tests\n`;
            output += `- Passing/Safe: ${p.passCount}\n`;
            output += `- Failing/Vulnerable: ${p.failCount}\n\n`;
          });

          // Top findings
          if (state.findings && state.findings.length > 0) {
            output += `### Discovered Vulnerabilities & Bugs\n`;
            state.findings.forEach((f: any, i: number) => {
              output += `${i + 1}. **[${f.severity}]** ${f.title}\n   ${f.description}\n`;
            });
          }

          output += `\n*For visual video execution and complete reports, open the local dashboard at http://localhost:4004*`;

          return { content: [{ type: "text", text: output }] };

        } catch (e: any) {
          return {
            isError: true,
            content: [{ type: "text", text: `Failed to fetch status: ${e.message}` }]
          };
        }
      }

      default:
        throw new Error("Unknown tool");
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${error.message}` }]
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bhrmshree MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
