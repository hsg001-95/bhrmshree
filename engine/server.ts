import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { PipelineRunner } from './pipeline-runner.ts';

/**
 * The Bhrmshree "Zero-Install" Web Server.
 * This server hosts the Dashboard and orchestrates the AI Agents.
 */
export async function startBhrmshreeServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  // Engine API now runs on 4005, Next.js dashboard on 4004
  const PORT = process.env.PORT || 4005;
  const pipeline = new PipelineRunner(io);

  // Enable CORS for all routes (dashboard is on a different port)
  app.use(cors());
  app.use(express.json());
  
  // Serve screenshots directory
  app.use('/screenshots', express.static(path.join(process.cwd(), 'dashboard/public/screenshots')));

  // API to get current scan state (for late-joining clients)
  app.get('/api/state', (_req: any, res: any) => {
    res.json(pipeline.currentState);
  });

  // API to start a new scan from the web interface
  app.post('/api/scan', async (req: any, res: any) => {
    const { targetUrl, id, repoDir } = req.body;
    console.log(`[Server] Received Scan Request for: ${targetUrl}`);
    if (repoDir) {
      console.log(`[Server] White-box mode enabled. Analyzing repo: ${repoDir}`);
    }
    
    // Respond immediately so the dashboard knows the scan started
    res.json({ status: 'started', scanId: id });

    // Run the pipeline in the background (non-blocking)
    pipeline.runScan(targetUrl, id, repoDir).catch((err: any) => {
      console.error('[Server] Pipeline error:', err);
      io.emit('update', { 
        log: { msg: `❌ Pipeline crashed: ${err.message}`, type: 'system' },
        phase: 'IDLE'
      });
    });
  });

  // Real-time Data Bridge
  io.on('connection', (socket) => {
    console.log('🌍 User connected to Bhrmshree Dashboard');
    
    // Send current state to newly connected clients
    if (pipeline.currentState.status !== 'idle') {
      socket.emit('state-sync', pipeline.currentState);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`
  🛡️  Bhrmshree PLATFORM IS LIVE
  --------------------------
  Dashboard:     http://localhost:${PORT}
  API Server:    http://localhost:${PORT}/api
  
  Open your browser to access the dashboard.
    `);
  });

  return { app, httpServer, io };
}
