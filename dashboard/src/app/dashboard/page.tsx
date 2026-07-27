'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, Search, Terminal, Eye, AlertTriangle, CheckCircle, 
  Globe, Activity, Zap, Crosshair, Radar, Bug, Lock, Scan, 
  Cpu, Wifi, ChevronRight, X, Play, Clock, FileWarning,
  Monitor, Skull, FolderSearch, ArrowRight, CircleCheck, 
  CircleX, Loader, ChevronDown, Camera, ExternalLink
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { createClient } from '../../lib/supabase';


// ═══════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

interface LogEntry {
  msg: string;
  type: 'qa' | 'sec' | 'info' | 'system';
  time: string;
}

interface FindingEntry {
  title: string;
  severity: string;
  type: string;
  description?: string;
  location?: string;
  screenshotUrl?: string;
}

interface TestCase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  phase: 'shadow' | 'sweeper';
  screenshotUrl?: string;
  errorMessage?: string;
  durationMs?: number;
  severity?: string;
  description?: string;
}

interface PhaseProgress {
  phase: 'shadow' | 'sweeper';
  totalTests: number;
  completed: number;
  passCount: number;
  failCount: number;
  currentTest?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
}

interface ScanSummary {
  scanId: string;
  targetUrl: string;
  totalDurationMs: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

type TabId = 'shadow' | 'sweeper';

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:4005';

// ═══════════════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════

export default function BhrmshreeDashboard() {
  // Core state
  const [activeTab, setActiveTab] = useState<TabId>('shadow');
  const [phase, setPhase] = useState<string>('IDLE');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [findings, setFindings] = useState<FindingEntry[]>([]);
  const [targetUrl, setTargetUrl] = useState('');
  const [repoDir, setRepoDir] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [scanTime, setScanTime] = useState(0);
  const [showLogs, setShowLogs] = useState(false);

  // Phase-specific state
  const [tests, setTests] = useState<TestCase[]>([]);
  const [phaseProgress, setPhaseProgress] = useState<Record<string, PhaseProgress>>({});
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);

  // Modal state
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Lifecycle ────────────────────────────────────────
  useEffect(() => {
    setHasMounted(true);
    setLogs([{ msg: 'Bhrmshree Engine initialized. Awaiting target acquisition.', type: 'system', time: new Date().toLocaleTimeString() }]);
  }, []);

  useEffect(() => {
    const socket: Socket = io(ENGINE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setLogs(prev => [...prev, { msg: '🟢 Connected to Bhrmshree Engine.', type: 'system', time: new Date().toLocaleTimeString() }]);
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      // Fallback check if HTTP server is responding
      fetch(`${ENGINE_URL}/api/state`)
        .then(res => { if (res.ok) setIsConnected(true); })
        .catch(() => setIsConnected(false));
    });

    socket.on('disconnect', () => setIsConnected(false));

    // Full state sync for late-joining clients
    socket.on('state-sync', (state: any) => {
      if (state.tests) setTests(state.tests);
      if (state.phases) setPhaseProgress(state.phases);
      if (state.findings) setFindings(state.findings);
      if (state.logs) setLogs(state.logs.map((l: any) => ({ ...l, time: l.time || new Date().toLocaleTimeString() })));
    });

    // Granular update events
    socket.on('update', (data: any) => {
      if (data.phase) {
        setPhase(data.phase);
        // Auto-switch tab based on phase
        if (data.phase === 'SECURITY_PROBE') setActiveTab('shadow');
      }

      if (data.log) {
        setLogs(prev => [...prev, { ...data.log, time: new Date().toLocaleTimeString() }].slice(-200));
      }

      if (data.finding) {
        setFindings(prev => [data.finding, ...prev]);
      }

      if (data.testCase) {
        setTests(prev => {
          const idx = prev.findIndex(t => t.id === data.testCase.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = data.testCase;
            return updated;
          }
          return [...prev, data.testCase];
        });
      }

      if (data.phaseProgress) {
        setPhaseProgress(prev => ({ ...prev, [data.phaseProgress.phase]: data.phaseProgress }));
      }

      if (data.scanSummary) {
        setScanSummary(data.scanSummary);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (phase !== 'IDLE') {
      timerRef.current = setInterval(() => setScanTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // ─── Helpers ──────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatMs = (ms?: number) => ms ? `${(ms / 1000).toFixed(1)}s` : '—';

  const getPhaseTests = (phaseId: TabId) => tests.filter(t => t.phase === phaseId);
  
  const getProgress = (phaseId: TabId): PhaseProgress => 
    phaseProgress[phaseId] || { phase: phaseId, totalTests: 0, completed: 0, passCount: 0, failCount: 0, status: 'idle' };

  const overallProgress = () => {
    const total = tests.length || 1;
    const completed = tests.filter(t => t.status === 'passed' || t.status === 'failed').length;
    return Math.round((completed / total) * 100);
  };

  // ─── Actions ──────────────────────────────────────────
  const startScan = async () => {
    if (!targetUrl) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLogs([{ msg: '⚠️ You must be logged in to start a scan. Please sign in.', type: 'system', time: new Date().toLocaleTimeString() }]);
      return;
    }

    const scanIdString = `scan-${Date.now()}`;
    
    // Insert into Supabase
    const { error } = await supabase.from('scans').insert({
      user_id: user.id,
      scan_id: scanIdString,
      target_url: targetUrl,
      repo_path: repoDir || null,
      status: 'pending'
    });

    if (error) {
      setLogs([{ msg: `⚠️ Failed to create scan record: ${error.message}`, type: 'system', time: new Date().toLocaleTimeString() }]);
      return;
    }

    setScanTime(0);
    setFindings([]);
    setTests([]);
    setPhaseProgress({});
    setScanSummary(null);
    setSelectedTest(null);
    setLogs([
      { msg: 'Bhrmshree Engine initialized.', type: 'system', time: new Date().toLocaleTimeString() },
      { msg: `🎯 Target locked: ${targetUrl}`, type: 'info', time: new Date().toLocaleTimeString() },
      ...(repoDir ? [{ msg: `📂 Repo path provided: ${repoDir}`, type: 'info' as const, time: new Date().toLocaleTimeString() }] : []),
    ]);
    setPhase('SECURITY_PROBE');
    setActiveTab('shadow');

    try {
      await fetch(`${ENGINE_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, repoDir, id: scanIdString })
      });
    } catch {
      setLogs(prev => [...prev, { msg: '⚠️ Failed to connect to engine. Is the server running?', type: 'system', time: new Date().toLocaleTimeString() }]);
    }
  };

  // ─── Status Icon Component ────────────────────────────
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'passed': return <div className="status-icon passed"><CircleCheck size={14} /></div>;
      case 'failed': return <div className="status-icon failed"><CircleX size={14} /></div>;
      case 'running': return <div className="status-icon running"><div className="spinner" /></div>;
      default: return <div className="status-icon pending"><Clock size={14} /></div>;
    }
  };

  // ═══════════════════════════════════════════════════════════
  //  PHASE 1: QA EXPLORER TAB
  // ═══════════════════════════════════════════════════════════

  // Phase 1 Explorer Tab component removed.

  // ═══════════════════════════════════════════════════════════
  //  PHASE 2: SHADOW AGENT TAB
  // ═══════════════════════════════════════════════════════════

  const ShadowTab = () => {
    const phaseTests = getPhaseTests('shadow');
    const progress = getProgress('shadow');
    const pct = progress.totalTests ? Math.round((progress.completed / progress.totalTests) * 100) : 0;
    const vulnCount = phaseTests.filter(t => t.status === 'failed').length;

    // Circular progress calculations
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    return (
      <div style={{ display: 'flex', gap: 20, height: '100%', overflow: 'hidden' }}>
        {/* Left: Progress & Matrix */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'hidden' }}>
          {/* Stats Row */}
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            {/* Circular Progress */}
            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
              <div className="circular-progress" style={{ width: 120, height: 120, flexShrink: 0 }}>
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                  <circle cx="60" cy="60" r={radius} fill="none" 
                    stroke={vulnCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'} 
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <span className="progress-value" style={{ color: vulnCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                  {pct}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Security Scan</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {progress.status === 'running' ? `Testing: ${progress.currentTest || '...'}` : 
                   progress.status === 'completed' ? 'Scan Complete' : 'Awaiting scan'}
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-green)' }}>{progress.passCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secure</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-red)' }}>{vulnCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vulns</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-secondary)' }}>{progress.totalTests - progress.completed}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Status Matrix */}
          <div className="glass-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crosshair size={13} style={{ color: 'var(--accent-red)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Test Matrix</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--accent-green)' }} /> Secure</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--accent-red)' }} /> Vuln</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--accent-blue)' }} /> Running</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--text-muted)', opacity: 0.3 }} /> Pending</span>
              </div>
            </div>
            <div style={{ padding: 18, flex: 1, overflowY: 'auto' }}>
              {phaseTests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Skull size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <p style={{ fontSize: 14, fontWeight: 500 }}>Shadow Agent on standby</p>
                  <p style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>Pentesting will begin after QA phase</p>
                </div>
              ) : (
                <>
                  <div className="status-matrix" style={{ marginBottom: 20 }}>
                    {phaseTests.map((test, i) => (
                      <div
                        key={test.id}
                        className={`matrix-cell ${test.status}`}
                        onClick={() => test.status !== 'pending' && setSelectedTest(test)}
                      >
                        {test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : test.status === 'running' ? '◉' : '○'}
                        <span className="tooltip">{test.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed list below matrix */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {phaseTests.map(test => (
                      <div
                        key={test.id}
                        className={`test-card ${test.status}`}
                        onClick={() => test.status !== 'pending' && setSelectedTest(test)}
                        style={{ padding: '10px 14px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <StatusIcon status={test.status} />
                          <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{test.name}</span>
                          {test.severity && <span className={`badge badge-${test.severity.toLowerCase()}`}>{test.severity}</span>}
                          {test.durationMs && <span className="terminal-text" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatMs(test.durationMs)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Attack Log */}
        <div className="glass-card" style={{ width: 340, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={13} style={{ color: 'var(--accent-red)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Attack Log</span>
            {progress.status === 'running' && <span className="badge badge-live" style={{ marginLeft: 'auto' }}>● LIVE</span>}
          </div>
          <div className="terminal-text" style={{ flex: 1, padding: 14, fontSize: 11, overflowY: 'auto', lineHeight: 1.7 }}>
            {logs.filter(l => l.type === 'sec' || l.type === 'system').slice(-50).map((log, i) => (
              <div key={i} className="attack-log-item" style={{ padding: '4px 0', borderBottom: 'none' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 60, flexShrink: 0, fontSize: 10 }}>[{log.time}]</span>
                <span style={{ color: log.type === 'sec' ? 'var(--accent-red)' : 'var(--text-secondary)', fontSize: 11 }}>{log.msg}</span>
              </div>
            ))}
            {logs.filter(l => l.type === 'sec' || l.type === 'system').length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--text-muted)', opacity: 0.5 }}>
                No security events yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  //  PHASE 3: SWEEPER TAB
  // ═══════════════════════════════════════════════════════════

  const SweeperTab = () => {
    const phaseTests = getPhaseTests('sweeper');
    const progress = getProgress('sweeper');
    const pct = progress.totalTests ? Math.round((progress.completed / progress.totalTests) * 100) : 0;
    const exposedCount = phaseTests.filter(t => t.status === 'failed').length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'hidden' }}>
        {/* Header Stats */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <div className="glass-card" style={{ flex: 1, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderSearch size={18} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Hidden Path Discovery</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-driven directory brute-forcing</div>
              </div>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill sweeper ${progress.status === 'running' ? 'animated' : ''}`} style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>{progress.completed}/{progress.totalTests} paths probed</span>
              <span>{pct}%</span>
            </div>
          </div>

          <div className="glass-card summary-stat" style={{ minWidth: 100 }}>
            <div className="value" style={{ color: 'var(--accent-green)' }}>{progress.passCount}</div>
            <div className="label">Safe</div>
          </div>
          <div className="glass-card summary-stat" style={{ minWidth: 100 }}>
            <div className="value" style={{ color: 'var(--accent-red)' }}>{exposedCount}</div>
            <div className="label">Exposed</div>
          </div>
          <div className="glass-card summary-stat" style={{ minWidth: 100 }}>
            <div className="value gradient-text">{progress.totalTests}</div>
            <div className="label">Probed</div>
          </div>
        </div>

        {/* Path Results Table */}
        <div className="glass-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileWarning size={13} style={{ color: 'var(--accent-purple)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Discovery Results</span>
            </div>
            {exposedCount > 0 && <span className="badge badge-critical">{exposedCount} Exposed</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
            {phaseTests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <FolderSearch size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>Sweeper Agent on standby</p>
                <p style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>Will begin after security testing</p>
              </div>
            ) : (
              <table className="path-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>Status</th>
                    <th>Path / Check</th>
                    <th>Risk Level</th>
                    <th>Duration</th>
                    <th style={{ width: 60 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {phaseTests.map(test => (
                    <tr key={test.id} className={test.status === 'failed' ? 'exposed' : ''}>
                      <td>
                        <StatusIcon status={test.status} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{test.name}</div>
                        {test.description && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{test.description}</div>}
                      </td>
                      <td>
                        {test.severity && <span className={`badge badge-${test.severity.toLowerCase()}`}>{test.severity}</span>}
                      </td>
                      <td>
                        <span className="terminal-text" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatMs(test.durationMs)}</span>
                      </td>
                      <td>
                        {test.status === 'failed' && (
                          <button 
                            onClick={() => setSelectedTest(test)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}
                          >
                            View <ExternalLink size={10} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  //  SCREENSHOT MODAL
  // ═══════════════════════════════════════════════════════════

  const TestModal = () => {
    if (!selectedTest) return null;

    return (
      <div className="modal-overlay" onClick={() => setSelectedTest(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span className={`badge badge-${selectedTest.status}`}>{selectedTest.status.toUpperCase()}</span>
                {selectedTest.severity && <span className={`badge badge-${selectedTest.severity.toLowerCase()}`}>{selectedTest.severity}</span>}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{selectedTest.name}</h2>
            </div>
            <button className="modal-close" onClick={() => setSelectedTest(null)}>
              <X size={16} />
            </button>
          </div>
          <div className="modal-body">
            {selectedTest.description && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Description</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedTest.description}</p>
              </div>
            )}

            {selectedTest.errorMessage && (
              <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: 'rgba(255,59,92,0.06)', border: '1px solid rgba(255,59,92,0.15)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Error Details</div>
                <p className="terminal-text" style={{ fontSize: 12, color: 'var(--accent-red)', lineHeight: 1.5 }}>{selectedTest.errorMessage}</p>
              </div>
            )}

            {selectedTest.durationMs && (
              <div style={{ marginBottom: 20, display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Duration</div>
                  <span className="terminal-text" style={{ fontSize: 14, fontWeight: 600 }}>{formatMs(selectedTest.durationMs)}</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Phase</div>
                  <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{selectedTest.phase}</span>
                </div>
              </div>
            )}

            {/* Screenshot */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Snapshot</div>
              <div className="screenshot-placeholder">
                {selectedTest.screenshotUrl ? (
                  <img 
                    src={selectedTest.screenshotUrl.startsWith('/') ? `${ENGINE_URL}${selectedTest.screenshotUrl}` : selectedTest.screenshotUrl} 
                    alt={`Screenshot for ${selectedTest.name}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `
                        <div style="text-align:center;padding:40px;">
                          <div style="font-size:36px;margin-bottom:12px;">📸</div>
                          <p style="font-size:13px;color:#8a8a9a;">Screenshot captured during scan</p>
                          <p style="font-size:11px;color:#555566;margin-top:4px;">The snapshot shows the exact state when this test ran</p>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <>
                    <Camera size={28} style={{ opacity: 0.4 }} />
                    <p style={{ fontSize: 13, fontWeight: 500 }}>Snapshot captured during scan</p>
                    <p style={{ fontSize: 11, opacity: 0.6 }}>Shows the browser state at the time of testing</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════

  if (!hasMounted) return null;

  // Removed explorerProgress
  const shadowProgress = getProgress('shadow');
  const sweeperProgress = getProgress('sweeper');
  const totalVulns = findings.length;
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;

  return (
    <main className="bg-grid" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* ═══════════ TOP BAR ═══════════ */}
      <header style={{
        height: 64,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Bhrmshree</h1>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Security Platform</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />

        {/* Connection Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8,
          background: isConnected ? 'rgba(0,230,118,0.06)' : 'rgba(255,59,92,0.06)',
          border: `1px solid ${isConnected ? 'rgba(0,230,118,0.15)' : 'rgba(255,59,92,0.15)'}`,
        }}>
          <Wifi size={11} style={{ color: isConnected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: isConnected ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* History Link */}
        <a href="/dashboard/history" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
          color: 'var(--text-muted)', textDecoration: 'none',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
          transition: 'all 0.15s',
        }}>
          <Clock size={12} /> History
        </a>

        {/* URL Input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Crosshair size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Target URL (e.g., https://example.com)"
            className="search-input terminal-text"
            style={{ width: '100%', padding: '9px 16px 9px 38px', fontSize: 12, fontWeight: 500 }}
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startScan()}
          />
        </div>

        {/* Repo Input */}
        <div style={{ flex: 1, position: 'relative', maxWidth: 300 }}>
          <FolderSearch size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Local Repo Path (Optional)"
            className="search-input terminal-text"
            style={{ width: '100%', padding: '9px 16px 9px 38px', fontSize: 12, fontWeight: 500 }}
            value={repoDir}
            onChange={(e) => setRepoDir(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startScan()}
          />
        </div>

        <button onClick={startScan} className="btn-primary" style={{ padding: '9px 24px', fontSize: 12, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <Scan size={14} /> LAUNCH SCAN
        </button>

        {/* Timer */}
        {phase !== 'IDLE' && (
          <div className="terminal-text" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
            <Clock size={12} />
            <span style={{ fontWeight: 600 }}>{formatTime(scanTime)}</span>
          </div>
        )}
      </header>

      {/* ═══════════ OVERALL PROGRESS BAR ═══════════ */}
      {phase !== 'IDLE' && (
        <div style={{ padding: '0 24px', flexShrink: 0 }}>
          <div className="overall-progress progress-bar" style={{ marginTop: 0, borderRadius: 0, height: 3 }}>
            <div className="progress-fill animated" style={{ width: `${overallProgress()}%`, background: 'var(--gradient-brand)', backgroundSize: '200% auto', animation: 'gradient-shift 3s ease infinite' }} />
          </div>
        </div>
      )}

      {/* ═══════════ TAB NAVIGATION ═══════════ */}
      <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
        <div className="tab-nav">
          {/* Explorer tab btn removed */}
          <button
            className={`tab-btn ${activeTab === 'shadow' ? 'active shadow' : ''}`}
            onClick={() => setActiveTab('shadow')}
          >
            <Skull size={14} />
            Phase 2: Shadow Agent
            {shadowProgress.status !== 'idle' && (
              <span className="tab-badge" style={{
                background: shadowProgress.failCount > 0 ? 'rgba(255,59,92,0.15)' : 'rgba(0,230,118,0.15)',
                color: shadowProgress.failCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
              }}>
                {shadowProgress.completed}/{shadowProgress.totalTests}
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'sweeper' ? 'active sweeper' : ''}`}
            onClick={() => setActiveTab('sweeper')}
          >
            <FolderSearch size={14} />
            Phase 3: Sweeper
            {sweeperProgress.status !== 'idle' && (
              <span className="tab-badge" style={{
                background: sweeperProgress.failCount > 0 ? 'rgba(255,59,92,0.15)' : 'rgba(0,230,118,0.15)',
                color: sweeperProgress.failCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
              }}>
                {sweeperProgress.completed}/{sweeperProgress.totalTests}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ═══════════ TAB CONTENT ═══════════ */}
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden' }}>
        {/* Explorer panel render removed */}
        {activeTab === 'shadow' && <ShadowTab />}
        {activeTab === 'sweeper' && <SweeperTab />}
      </div>

      {/* ═══════════ BOTTOM: COLLAPSIBLE LOG BAR ═══════════ */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button
          onClick={() => setShowLogs(!showLogs)}
          style={{
            width: '100%', padding: '8px 24px',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
          }}
        >
          <Terminal size={12} style={{ color: 'var(--accent-green)' }} />
          KILL-CHAIN LOGS
          <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.5 }}>({logs.length})</span>
          <ChevronDown size={12} style={{ marginLeft: 'auto', transform: showLogs ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </button>
        {showLogs && (
          <div className="terminal-text" style={{ maxHeight: 200, padding: '0 24px 12px', fontSize: 11, overflowY: 'auto', lineHeight: 1.7 }}>
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 1 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 70, flexShrink: 0 }}>[{log.time}]</span>
                <span style={{
                  minWidth: 30, flexShrink: 0, fontWeight: 600,
                  color: log.type === 'qa' ? 'var(--accent-green)' :
                    log.type === 'sec' ? 'var(--accent-red)' :
                    log.type === 'system' ? 'var(--accent-purple)' :
                    'var(--accent-blue)',
                }}>
                  {log.type === 'qa' ? 'QA' : log.type === 'sec' ? 'SEC' : log.type === 'system' ? 'SYS' : 'INF'}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.msg}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* ═══════════ SCAN SUMMARY BANNER ═══════════ */}
      {scanSummary && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'linear-gradient(90deg, rgba(168,85,247,0.05), rgba(255,59,92,0.05))',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>SCAN COMPLETE</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <span className="terminal-text" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Duration: {(scanSummary.totalDurationMs / 1000).toFixed(1)}s
          </span>
          <span className="terminal-text" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Findings: <span style={{ color: scanSummary.totalFindings > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 700 }}>{scanSummary.totalFindings}</span>
          </span>
          {scanSummary.criticalCount > 0 && <span className="badge badge-critical">{scanSummary.criticalCount} Critical</span>}
          {scanSummary.highCount > 0 && <span className="badge badge-high">{scanSummary.highCount} High</span>}
          {scanSummary.mediumCount > 0 && <span className="badge badge-medium">{scanSummary.mediumCount} Medium</span>}
          {scanSummary.lowCount > 0 && <span className="badge badge-low">{scanSummary.lowCount} Low</span>}
        </div>
      )}

      {/* Screenshot Modal */}
      {selectedTest && <TestModal />}
    </main>
  );
}
