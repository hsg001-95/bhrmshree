'use client';

import React from 'react';
import { Shield, Zap, Eye, Scan, ChevronRight, Lock, Bug, FolderSearch, Terminal, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="brand-icon"><Shield size={20} color="white" /></div>
            <span className="brand-name">Bhrmshree</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            <a href="/login" className="btn-ghost">Log In</a>
            <a href="/signup" className="btn-primary-landing">Get Started <ArrowRight size={14} /></a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <Star size={12} /> AI-Powered Security Testing
        </div>
        <h1 className="hero-title">
          Find Bugs & Vulnerabilities<br />
          <span className="gradient-text-hero">Before Hackers Do.</span>
        </h1>
        <p className="hero-subtitle">
          Bhrmshree autonomously explores your web app like a real user, then weaponizes that knowledge
          to find security vulnerabilities. QA + Pentesting in one intelligent pipeline.
        </p>
        <div className="hero-cta">
          <a href="/signup" className="btn-primary-hero">
            <Scan size={18} /> Start Free Scan
          </a>
          <a href="#how-it-works" className="btn-outline-hero">
            See How It Works <ChevronRight size={16} />
          </a>
        </div>
        <div className="hero-stats">
          <div className="stat-item"><span className="stat-value">3</span><span className="stat-label">AI Agents</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><span className="stat-value">50+</span><span className="stat-label">Attack Vectors</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><span className="stat-value">Real-time</span><span className="stat-label">Dashboard</span></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Three Autonomous AI Agents</h2>
        <p className="section-subtitle">Each agent specializes in a different aspect of security and quality assurance</p>
        <div className="features-grid">
          <div className="feature-card explorer-card">
            <div className="feature-icon explorer"><Eye size={24} /></div>
            <h3>Explorer Agent</h3>
            <p className="feature-phase">Phase 1 — QA Reconnaissance</p>
            <p>Maps your application like a real user. Navigates pages, fills forms, clicks buttons.
            Generates and executes dynamic Playwright test suites with video recording.</p>
            <ul className="feature-list">
              <li>AI-generated test plans from codebase analysis</li>
              <li>Automated happy path verification</li>
              <li>Per-test video recordings</li>
            </ul>
          </div>

          <div className="feature-card shadow-card">
            <div className="feature-icon shadow"><Lock size={24} /></div>
            <h3>Shadow Agent</h3>
            <p className="feature-phase">Phase 2 — Security Penetration</p>
            <p>Uses the Explorer's functional map as a blueprint to launch surgical attacks.
            Multi-turn exploitation with Gemini reasoning.</p>
            <ul className="feature-list">
              <li>XSS, SQLi, SSRF, IDOR attacks</li>
              <li>Authentication bypass attempts</li>
              <li>CORS & security header audits</li>
              <li>CSRF token validation</li>
            </ul>
          </div>

          <div className="feature-card sweeper-card">
            <div className="feature-icon sweeper"><FolderSearch size={24} /></div>
            <h3>Sweeper Agent</h3>
            <p className="feature-phase">Phase 3 — Hidden Path Discovery</p>
            <p>AI-driven "hyper-guessing" to discover exposed files, debug endpoints,
            and admin panels that shouldn't be public.</p>
            <ul className="feature-list">
              <li>.env and .git exposure detection</li>
              <li>Admin panel discovery</li>
              <li>Source map and config file scanning</li>
              <li>Backup file probing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">"Hacking the Happy Path" — a fundamentally smarter approach</p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Paste Your URL</h3>
            <p>Enter the target URL and optionally provide your local codebase path for white-box analysis.</p>
          </div>
          <div className="step-arrow"><ArrowRight size={24} /></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Explores & Attacks</h3>
            <p>Three autonomous agents work in sequence — exploring, penetration testing, and sweeping for hidden paths.</p>
          </div>
          <div className="step-arrow"><ArrowRight size={24} /></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Your Report</h3>
            <p>Receive a unified DevSecQA report with bugs, vulnerabilities, video evidence, and remediation steps.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Simple Pricing</h2>
        <p className="section-subtitle">Start free, upgrade when you need more</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">$0<span>/month</span></div>
            <ul>
              <li>3 scans per month</li>
              <li>All 3 AI agents</li>
              <li>Basic reporting</li>
              <li>Community support</li>
            </ul>
            <a href="/signup" className="btn-outline-price">Get Started</a>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price">$29<span>/month</span></div>
            <ul>
              <li>Unlimited scans</li>
              <li>White-box analysis</li>
              <li>MCP IDE integration</li>
              <li>Video recordings</li>
              <li>Priority support</li>
            </ul>
            <a href="/signup" className="btn-primary-price">Start Pro Trial</a>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <ul>
              <li>Everything in Pro</li>
              <li>Team collaboration</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
              <li>On-premise option</li>
            </ul>
            <a href="/signup" className="btn-outline-price">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-icon"><Shield size={16} color="white" /></div>
            <span>Bhrmshree</span>
          </div>
          <p className="footer-tagline">Hacking the Happy Path.</p>
          <p className="footer-copy">© 2026 Bhrmshree. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
