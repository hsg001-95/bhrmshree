export type AgentRole = 'EXPLORER' | 'SHADOW' | 'VERIFIER';
export type ScanPhase = 'DISCOVERY' | 'SECURITY_PROBE' | 'VALIDATION' | 'REPORTING';

export interface BhrmshreeTask {
  id: string;
  role: AgentRole;
  phase: ScanPhase;
  targetUrl: string;
  repoPath: string;
  context?: string; // Shared context passed between agents
}

export interface AgentResult {
  taskId: string;
  success: boolean;
  findings: Finding[];
  metrics: {
    durationMs: number;
    tokensUsed: number;
    costUsd: number;
  };
  screenshotPaths?: string[];
}

export interface Finding {
  type: 'BUG' | 'VULNERABILITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  reproSteps: string[];
  location: string; // URL or File path
  screenshotUrl?: string; // Dashboard-servable screenshot path
}

export interface PipelineState {
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  currentPhase: ScanPhase;
  discoveredEndpoints: string[];
  vulnerabilities: Finding[];
  bugs: Finding[];
}

// ═══════════════════════════════════════════════════════════
//  Dashboard Event Types (Socket.IO)
// ═══════════════════════════════════════════════════════════

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestCase {
  id: string;
  name: string;
  status: TestStatus;
  phase: 'explorer' | 'shadow' | 'sweeper';
  screenshotUrl?: string;   // URL to screenshot when test completes
  videoUrl?: string;        // URL to recorded video of the test
  errorMessage?: string;    // Error details if failed
  durationMs?: number;      // How long it took
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;     // What the test does
}

export interface PhaseProgress {
  phase: 'explorer' | 'shadow' | 'sweeper';
  totalTests: number;
  completed: number;
  passCount: number;
  failCount: number;
  currentTest?: string;     // Name of currently running test
  status: 'idle' | 'running' | 'completed' | 'failed';
  startedAt?: number;       // timestamp
  completedAt?: number;     // timestamp
}

export interface ScanSummary {
  scanId: string;
  targetUrl: string;
  totalDurationMs: number;
  phases: {
    explorer: PhaseProgress;
    shadow: PhaseProgress;
    sweeper: PhaseProgress;
  };
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

// Socket.IO event payloads
export interface DashboardUpdate {
  // Legacy fields (kept for compatibility)
  phase?: string;
  log?: { msg: string; type: string };
  finding?: Finding;
  screenshot?: string;
  discoveredCount?: number;

  // New granular events
  event?: 'phase-start' | 'phase-end' | 'test-start' | 'test-result' | 'screenshot-captured' | 'scan-complete';
  
  // Phase events
  phaseProgress?: PhaseProgress;
  
  // Test events
  testCase?: TestCase;
  
  // Scan complete
  scanSummary?: ScanSummary;
}
