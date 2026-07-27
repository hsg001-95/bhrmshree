"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBhrmshreeServer = startBhrmshreeServer;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const workflows_js_1 = require("./workflows.js");
const types_js_1 = require("../shared/types.js");
/**
 * The Bhrmshree "Zero-Install" Web Server.
 * This server hosts the Dashboard and orchestrates the AI Agents.
 */
async function startBhrmshreeServer() {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: "*" }
    });
    const PORT = process.env.PORT || 3000;
    // Serve the Dashboard files (the user just uses their browser)
    app.use(express_1.default.static(path_1.default.join(process.cwd(), 'dashboard/out')));
    app.use(express_1.default.json());
    // API to start a new scan from the web interface
    app.post('/api/scan', async (req, res) => {
        const task = req.body;
        console.log(`[Server] Received Scan Request for: ${task.targetUrl}`);
        // Trigger the Temporal Workflow in the background
        // In a full implementation, we'd use the Temporal Client here
        res.json({ status: 'started', scanId: task.id });
    });
    // Real-time Data Bridge
    io.on('connection', (socket) => {
        console.log('🌍 User connected to Bhrmshree Dashboard');
        // This is where the AI Agents will "push" their live updates
        // e.g., socket.emit('action', { type: 'CLICK', target: 'Login' });
    });
    httpServer.listen(PORT, () => {
        console.log(`
  🛡️  Bhrmshree PLATFORM IS LIVE
  --------------------------
  Local Access:  http://localhost:${PORT}
  Network:       http://0.0.0.0:${PORT}
  
  Users can now access the dashboard via any Web Browser.
    `);
    });
}
//# sourceMappingURL=server.js.map