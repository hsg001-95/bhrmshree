'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, Clock, AlertTriangle, CheckCircle, XCircle,
  ChevronRight, Search, Filter, ArrowLeft, Globe,
  Loader, RefreshCw, Calendar, BarChart3, Target,
  Bug, Lock, FolderSearch, Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

interface ScanRecord {
  id: string;
  scan_id: string;
  target_url: string;
  repo_path: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
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

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setScans(data as ScanRecord[]);
    }
    setLoading(false);
  };

  // ─── Filtering ────────────────────────────────────────
  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.target_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.scan_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ─── Helpers ──────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--accent-green)';
      case 'running': return 'var(--accent-blue)';
      case 'failed': return 'var(--accent-red)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'running': return <Loader size={14} className="spin" />;
      case 'failed': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  // ─── Stats ────────────────────────────────────────────
  const totalScans = scans.length;
  const completedScans = scans.filter(s => s.status === 'completed').length;
  const totalFindings = scans.reduce((sum, s) => sum + (s.total_findings || 0), 0);
  const totalCritical = scans.reduce((sum, s) => sum + (s.critical_count || 0), 0);

  return (
    <main className="bg-grid" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ═══════════ TOP BAR ═══════════ */}
      <header style={{
        height: 64, borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16, flexShrink: 0,
      }}>
        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Scan History</h1>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>All DevSecQA Scans</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={fetchScans} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: '8px 16px', color: 'var(--text-secondary)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </header>

      {/* ═══════════ CONTENT ═══════════ */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={18} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Scans</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{totalScans}</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completed</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent-green)' }}>{completedScans}</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,171,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bug size={18} style={{ color: 'var(--accent-amber)' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Findings</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{totalFindings}</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,59,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Critical</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent-red)' }}>{totalCritical}</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by URL or Scan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
            }}
          />
          <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
          <Filter size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {['all', 'completed', 'running', 'failed', 'pending'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: statusFilter === s ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: statusFilter === s ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {s}
            </button>
          ))}
        </div>

        {/* Scan Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader size={28} className="spin" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 13 }}>Loading scan history...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Target size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No scans found</p>
              <p style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>
                {scans.length === 0 ? 'Launch your first scan from the Dashboard' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Target</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Findings</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Duration</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '14px 18px', width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map(scan => (
                  <tr key={scan.id} style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => window.location.href = `/dashboard/scan/${scan.id}`}
                  >
                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: getStatusColor(scan.status) }}>
                          {getStatusIcon(scan.status)}
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.04em', color: getStatusColor(scan.status),
                        }}>
                          {scan.status}
                        </span>
                      </div>
                    </td>

                    {/* Target URL */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {scan.target_url}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                            {scan.scan_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Scan Type */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: scan.repo_path ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)',
                        color: scan.repo_path ? 'var(--accent-purple)' : 'var(--accent-blue)',
                        border: `1px solid ${scan.repo_path ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)'}`,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                      }}>
                        {scan.repo_path ? 'White-Box' : 'Black-Box'}
                      </span>
                    </td>

                    {/* Findings */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{scan.total_findings || 0}</span>
                        {scan.critical_count > 0 && (
                          <span style={{
                            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                            background: 'rgba(255,59,92,0.1)', color: 'var(--accent-red)',
                            border: '1px solid rgba(255,59,92,0.2)',
                          }}>
                            {scan.critical_count} CRIT
                          </span>
                        )}
                        {scan.high_count > 0 && (
                          <span style={{
                            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                            background: 'rgba(255,171,0,0.1)', color: 'var(--accent-amber)',
                            border: '1px solid rgba(255,171,0,0.2)',
                          }}>
                            {scan.high_count} HIGH
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {formatDuration(scan.total_duration_ms)}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(scan.created_at)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{formatTime(scan.created_at)}</div>
                    </td>

                    {/* Arrow */}
                    <td style={{ padding: '14px 18px' }}>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
