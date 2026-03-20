export type AgentRole = 'EXPLORER' | 'SHADOW' | 'VERIFIER';
export type ScanPhase = 'DISCOVERY' | 'SECURITY_PROBE' | 'VALIDATION' | 'REPORTING';
export interface BhrmshreeTask {
    id: string;
    role: AgentRole;
    phase: ScanPhase;
    targetUrl: string;
    repoPath: string;
    context?: string;
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
    location: string;
}
export interface PipelineState {
    status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    currentPhase: ScanPhase;
    discoveredEndpoints: string[];
    vulnerabilities: Finding[];
    bugs: Finding[];
}
//# sourceMappingURL=types.d.ts.map