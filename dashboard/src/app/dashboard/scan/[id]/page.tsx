'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield, Clock, AlertTriangle, CheckCircle, XCircle,
  ArrowLeft, Globe, Loader, Bug, Lock, Eye,
  ChevronDown, ChevronUp, Play, ExternalLink,
  Target, FolderSearch, Monitor, Skull, Camera,
  Download, Share2, BarChart3
} from 'lucide-react';
import { createClient } from '../../../../lib/supabase';


// ═══════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

interface ScanRecord {
  id: string;
  scan_id: string;
  target_url: string;
  repo_path: string | null;
  status: string;
  current_phase: string;
  total_duration_ms: number | null;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  created_at: string;
  completed_at: string | null;
}

interface FindingRecord {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string | null;
  repro_steps: string[];
  location: string | null;
  screenshot_url: string | null;
  created_at: string;
}

interface TestCaseRecord {
  id: string;
  test_id: string;
  name: string;
  description: string | null;
  phase: string;
  status: string;
  severity: string | null;
  error_message: string | null;
  duration_ms: number | null;
  screenshot_url: string | null;
  video_url: string | null;
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function ScanReportPage() {
  const params = useParams();
  const scanId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  const [testCases, setTestCases] = useState<TestCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhaseTab, setActivePhaseTab] = useState<string>('all');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  useEffect(() => {
    fetchScanData();
  }, [scanId]);

  const fetchScanData = async () => {
    if (!scanId) return;
    setLoading(true);
    const supabase = createClient();

    // Fetch scan record
    const { data: scanData } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanData) setScan(scanData as ScanRecord);

    // Fetch findings
    const { data: findingsData } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: true });

    if (findingsData) setFindings(findingsData as FindingRecord[]);

    // Fetch test cases
    const { data: testData } = await supabase
      .from('test_cases')
      .select('*')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: true });

    if (testData) setTestCases(testData as TestCaseRecord[]);

    setLoading(false);
  };

  // ─── Helpers ──────────────────────────────────────────
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    const s = Math.floor(ms / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  };

  const getSeverityStyle = (severity: string) => {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      CRITICAL: { bg: 'rgba(255,59,92,0.08)', color: 'var(--accent-red)', border: 'rgba(255,59,92,0.2)' },
      HIGH: { bg: 'rgba(255,171,0,0.08)', color: 'var(--accent-amber)', border: 'rgba(255,171,0,0.2)' },
      MEDIUM: { bg: 'rgba(59,130,246,0.08)', color: 'var(--accent-blue)', border: 'rgba(59,130,246,0.2)' },
      LOW: { bg: 'rgba(0,230,118,0.08)', color: 'var(--accent-green)', border: 'rgba(0,230,118,0.2)' },
    };
    return styles[severity] || styles['MEDIUM'];
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'explorer': return <Monitor size={14} />;
      case 'shadow': return <Skull size={14} />;
      case 'sweeper': return <FolderSearch size={14} />;
      default: return <Target size={14} />;
    }
  };

  const filteredTests = activePhaseTab === 'all'
    ? testCases
    : testCases.filter(t => t.phase === activePhaseTab);

  if (loading) {
    return (
      <main className="bg-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader size={32} className="spin" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, fontWeight: 600 }}>Loading scan report...</p>
        </div>
      </main>
    );
  }

  if (!scan) {
    return (
      <main className="bg-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertTriangle size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 700 }}>Scan Not Found</p>
          <a href="/dashboard/history" style={{ color: 'var(--accent-blue)', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Back to History</a>
        </div>
      </main>
    );
  }

  const shadowTests = testCases.filter(t => t.phase === 'shadow');
  const sweeperTests = testCases.filter(t => t.phase === 'sweeper');

  return (
    <main className="bg-grid" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ═══════════ TOP BAR ═══════════ */}
      <header style={{
        height: 64, borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16, flexShrink: 0,
      }}>
        <a href="/dashboard/history" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
          <ArrowLeft size={14} /> History
        </a>
        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Scan Report</h1>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>{scan.scan_id}</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: scan.status === 'completed' ? 'rgba(0,230,118,0.1)' : scan.status === 'failed' ? 'rgba(255,59,92,0.1)' : 'rgba(59,130,246,0.1)',
            color: scan.status === 'completed' ? 'var(--accent-green)' : scan.status === 'failed' ? 'var(--accent-red)' : 'var(--accent-blue)',
            border: `1px solid ${scan.status === 'completed' ? 'rgba(0,230,118,0.2)' : scan.status === 'failed' ? 'rgba(255,59,92,0.2)' : 'rgba(59,130,246,0.2)'}`,
          }}>
            {scan.status}
          </span>
        </div>
      </header>

      {/* ═══════════ CONTENT ═══════════ */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

        {/* Scan Metadata Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Target</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={13} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target_url}</span>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Scan Type</div>
            <span style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: scan.repo_path ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)',
              color: scan.repo_path ? 'var(--accent-purple)' : 'var(--accent-blue)',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              {scan.repo_path ? 'White-Box' : 'Black-Box'}
            </span>
          </div>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Duration</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formatDuration(scan.total_duration_ms)}</span>
            </div>
          </div>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Started</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(scan.created_at)}</span>
          </div>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Total Findings</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: scan.total_findings > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{scan.total_findings}</span>
              {scan.critical_count > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-red)' }}>{scan.critical_count} CRIT</span>}
            </div>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={14} style={{ color: 'var(--accent-blue)' }} />
            Severity Breakdown
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Critical', count: scan.critical_count, color: 'var(--accent-red)' },
              { label: 'High', count: scan.high_count, color: 'var(--accent-amber)' },
              { label: 'Medium', count: scan.medium_count, color: 'var(--accent-blue)' },
              { label: 'Low', count: scan.low_count, color: 'var(--accent-green)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, background: s.color, transition: 'width 0.6s ease',
                    width: `${scan.total_findings > 0 ? (s.count / scan.total_findings) * 100 : 0}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout: Findings + Test Cases */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* ═══════════ FINDINGS ═══════════ */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 600, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} style={{ color: 'var(--accent-red)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Findings ({findings.length})
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {findings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>No vulnerabilities found</p>
                  <p style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>The target passed all security checks</p>
                </div>
              ) : (
                findings.map(finding => {
                  const sev = getSeverityStyle(finding.severity);
                  const isExpanded = expandedFinding === finding.id;
                  return (
                    <div key={finding.id} style={{
                      marginBottom: 8, borderRadius: 12, background: sev.bg, border: `1px solid ${sev.border}`,
                      overflow: 'hidden', transition: 'all 0.2s',
                    }}>
                      <div
                        onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800,
                          background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
                          letterSpacing: '0.06em',
                        }}>
                          {finding.severity}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                          background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
                          letterSpacing: '0.04em',
                        }}>
                          {finding.type}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{finding.title}</span>
                        {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      {isExpanded && (
                        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${sev.border}` }}>
                          {finding.description && (
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12 }}>{finding.description}</p>
                          )}
                          {finding.location && (
                            <div style={{ marginTop: 10 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Location: </span>
                              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{finding.location}</span>
                            </div>
                          )}
                          {finding.repro_steps && finding.repro_steps.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Reproduction Steps</div>
                              <ol style={{ paddingLeft: 20, margin: 0 }}>
                                {finding.repro_steps.map((step, i) => (
                                  <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ═══════════ TEST CASES ═══════════ */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 600, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={14} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Test Cases ({testCases.length})
              </span>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 'shadow', 'sweeper'].map(tab => (
                  <button key={tab} onClick={() => setActivePhaseTab(tab)} style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: activePhaseTab === tab ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: activePhaseTab === tab ? 'var(--accent-blue)' : 'var(--text-muted)',
                    border: activePhaseTab === tab ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {filteredTests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Target size={28} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontSize: 13 }}>No test cases for this phase</p>
                </div>
              ) : (
                filteredTests.map(test => (
                  <div key={test.id} style={{
                    padding: '10px 14px', borderRadius: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10,
                    background: test.status === 'failed' ? 'rgba(255,59,92,0.04)' : 'transparent',
                    border: `1px solid ${test.status === 'failed' ? 'rgba(255,59,92,0.1)' : 'transparent'}`,
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: test.status === 'passed' ? 'rgba(0,230,118,0.1)' : test.status === 'failed' ? 'rgba(255,59,92,0.1)' : 'rgba(255,255,255,0.04)',
                      color: test.status === 'passed' ? 'var(--accent-green)' : test.status === 'failed' ? 'var(--accent-red)' : 'var(--text-muted)',
                    }}>
                      {test.status === 'passed' ? <CheckCircle size={13} /> : test.status === 'failed' ? <XCircle size={13} /> : <Clock size={13} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{test.name}</div>
                      {test.error_message && (
                        <div style={{ fontSize: 10, color: 'var(--accent-red)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                          {test.error_message.substring(0, 80)}{test.error_message.length > 80 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{getPhaseIcon(test.phase)}</span>
                      {test.severity && (
                        <span style={{
                          ...(() => { const s = getSeverityStyle(test.severity); return { background: s.bg, color: s.color, border: `1px solid ${s.border}` }; })(),
                          padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                        }}>
                          {test.severity}
                        </span>
                      )}
                      {test.duration_ms && (
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {(test.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      {test.video_url && (
                        <a href={test.video_url} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Play size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
