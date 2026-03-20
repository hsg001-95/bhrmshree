#!/usr/bin/env node
import { ExplorerAgent } from './engine/agents/explorer.ts';
import { ShadowAgent } from './engine/agents/shadow.ts';
import { SweeperAgent } from './engine/agents/sweeper.ts';
import { startBhrmshreeServer } from './engine/server.ts';
import type { BhrmshreeTask, AgentResult, Finding } from './shared/types.ts';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ═══════════════════════════════════════════════════════════
//  BHRMSHREE — AI-Driven Security & QA Platform (CLI Mode)
// ═══════════════════════════════════════════════════════════

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

function banner() {
  console.log(`
${COLORS.magenta}${COLORS.bold}
  ██████╗ ██╗  ██╗██████╗ ███╗   ███╗███████╗██╗  ██╗██████╗ ███████╗███████╗
  ██╔══██╗██║  ██║██╔══██╗████╗ ████║██╔════╝██║  ██║██╔══██╗██╔════╝██╔════╝
  ██████╔╝███████║██████╔╝██╔████╔██║███████╗███████║██████╔╝█████╗  █████╗  
  ██╔══██╗██╔══██║██╔══██╗██║╚██╔╝██║╚════██║██╔══██║██╔══██╗██╔══╝  ██╔══╝  
  ██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║███████║██║  ██║██║  ██║███████╗███████╗
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
${COLORS.reset}
  ${COLORS.gray}v1.0.0 • AI-Driven Security & QA Platform${COLORS.reset}
  ${COLORS.gray}Powered by Gemini 3.1 Pro Preview + Playwright${COLORS.reset}
  `);
}

function log(msg: string, type: 'info' | 'qa' | 'sec' | 'system' | 'error' | 'success' = 'info') {
  const time = new Date().toLocaleTimeString();
  const prefix: Record<string, string> = {
    info: `${COLORS.blue}[INF]${COLORS.reset}`,
    qa: `${COLORS.green}[QA ]${COLORS.reset}`,
    sec: `${COLORS.red}[SEC]${COLORS.reset}`,
    system: `${COLORS.magenta}[SYS]${COLORS.reset}`,
    error: `${COLORS.bgRed} ERR ${COLORS.reset}`,
    success: `${COLORS.bgGreen} OK  ${COLORS.reset}`,
  };
  console.log(`  ${COLORS.gray}${time}${COLORS.reset} ${prefix[type]} ${msg}`);
}

function printFinding(f: Finding, index: number) {
  const sevColors: Record<string, string> = {
    CRITICAL: COLORS.bgRed,
    HIGH: COLORS.red,
    MEDIUM: COLORS.yellow,
    LOW: COLORS.blue,
  };
  const sevColor = sevColors[f.severity] || COLORS.gray;
  console.log(`
  ${COLORS.bold}┌─ Finding #${index + 1} ──────────────────────────────────────────${COLORS.reset}
  │ ${COLORS.bold}${f.title}${COLORS.reset}
  │ Severity: ${sevColor}${COLORS.bold} ${f.severity} ${COLORS.reset}
  │ Type:     ${f.type}
  │ Location: ${COLORS.cyan}${f.location}${COLORS.reset}
  │ ${f.description}
  │ Repro Steps:
${f.reproSteps.map(s => `  │   → ${s}`).join('\n')}
  ${COLORS.bold}└────────────────────────────────────────────────────${COLORS.reset}`);
}

function parseArgs(args: string[]): { url: string; repo: string } {
  let url = '';
  let repo = '';

  for (const arg of args) {
    if (arg.startsWith('URL=')) url = arg.substring(4);
    else if (arg.startsWith('REPO=')) repo = arg.substring(5);
    else if (arg === 'start') continue;
    else if (arg.startsWith('http')) url = arg;
  }

  return { url, repo };
}

async function scanCodebaseContext(repoPath: string): Promise<string> {
  if (!repoPath) return '';
  
  log(`📂 Reading codebase from: ${COLORS.cyan}${repoPath}${COLORS.reset}`, 'system');
  
  let context = '## LOCAL CODEBASE CONTEXT (White-Box)\n\n';
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.env', '.yaml', '.yml'];
  const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'build', '__pycache__', '.venv', 'venv'];
  
  async function walk(dir: string, depth: number = 0): Promise<string[]> {
    if (depth > 3) return [];
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoreDirs.includes(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await walk(fullPath, depth + 1));
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch {}
    return files;
  }
  
  const files = await walk(repoPath);
  log(`📄 Found ${files.length} source files for white-box analysis`, 'system');
  
  // Read key files (API routes, auth, config, etc.)
  const priorityKeywords = ['route', 'api', 'auth', 'login', 'config', 'schema', 'model', 'middleware', 'password', 'secret', 'token', 'admin'];
  const priorityFiles = files.filter(f => 
    priorityKeywords.some(kw => f.toLowerCase().includes(kw))
  ).slice(0, 15);
  
  // Also include a few regular files for context
  const otherFiles = files.filter(f => !priorityFiles.includes(f)).slice(0, 10);
  const filesToRead = [...priorityFiles, ...otherFiles];
  
  for (const file of filesToRead) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const relativePath = path.relative(repoPath, file);
      // Truncate large files
      const truncated = content.length > 2000 ? content.substring(0, 2000) + '\n...(truncated)' : content;
      context += `### ${relativePath}\n\`\`\`\n${truncated}\n\`\`\`\n\n`;
    } catch {}
  }
  
  log(`🧠 White-box context ready (${(context.length / 1024).toFixed(0)}KB of source code)`, 'success');
  return context;
}

async function main() {
  banner();

  const rawArgs = process.argv.slice(2);
  
  if (rawArgs.length === 0 || rawArgs.includes('--help') || rawArgs.includes('-h')) {
    console.log(`
  ${COLORS.bold}Usage:${COLORS.reset}
    ${COLORS.cyan}bhrmshree start URL=<target_url> [REPO=<local_code_path>]${COLORS.reset}
    ${COLORS.cyan}bhrmshree serve${COLORS.reset}

  ${COLORS.bold}Examples:${COLORS.reset}
    ${COLORS.gray}# Basic scan (black-box)${COLORS.reset}
    npx tsx bhrmshree.ts start URL=http://localhost:3000

    ${COLORS.gray}# White-box scan with local codebase${COLORS.reset}
    npx tsx bhrmshree.ts start URL=http://localhost:3000 REPO="C:\\path\\to\\code"

    ${COLORS.gray}# Start dashboard only (run scans from UI)${COLORS.reset}
    npx tsx bhrmshree.ts serve

  ${COLORS.bold}Options:${COLORS.reset}
    start          Start a scan immediately from the CLI
    serve          Start the dashboard server in standby mode
    URL=<url>      Target website URL to scan
    REPO=<path>    Local codebase path for white-box analysis (optional)
    --help, -h     Show this help message
    `);
    process.exit(0);
  }

  const isServeMode = rawArgs[0] === 'serve';
  const { url, repo } = parseArgs(rawArgs);
  
  if (!isServeMode && !url) {
    console.error(`  ${COLORS.bgRed} ERROR ${COLORS.reset} Missing target URL. Usage: bhrmshree start URL=http://localhost:3000`);
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY || '';
  if (!apiKey) {
    console.error(`  ${COLORS.bgRed} ERROR ${COLORS.reset} GOOGLE_AI_API_KEY not set in .env file`);
    process.exit(1);
  }

  const scanId = `scan-${Date.now()}`;
  const startTime = Date.now();
  const allFindings: Finding[] = [];

  console.log(`  ${COLORS.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  log(`🎯 Target: ${COLORS.bold}${url}${COLORS.reset}`, 'system');
  log(`🔑 Scan ID: ${scanId}`, 'system');
  if (repo) log(`📂 Repo: ${COLORS.bold}${repo}${COLORS.reset}`, 'system');
  log(`🤖 Model: Gemini 3.1 Pro Preview`, 'system');
  console.log(`  ${COLORS.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);

  // ═══════════ LAUNCH DASHBOARD SERVER ═══════════
  const dashboardPort = process.env.PORT || 4004;
  console.log(`
  ${COLORS.bgMagenta}${COLORS.bold} 🖥️  LAUNCHING DASHBOARD ${COLORS.reset}
  
  ${COLORS.bold}${COLORS.cyan}  ➜ Dashboard: http://localhost:${dashboardPort}${COLORS.reset}
  ${COLORS.gray}  Open this URL in your browser to watch the scan live.${COLORS.reset}
  `);
  
  try {
    await startBhrmshreeServer();
    log('🖥️  Dashboard server is live and accepting connections!', 'success');
  } catch (serverError: any) {
    log(`⚠️  Dashboard server failed to start: ${serverError.message}`, 'error');
    if (isServeMode) process.exit(1);
    log('Continuing with CLI-only mode...', 'system');
  }

  if (isServeMode) {
    log('⏳ Engine is in STANDBY mode. Launch scans from the Dashboard UI.', 'system');
    // Keep process alive
    return;
  }

  // Phase 0: Read local codebase for white-box context
  let codeContext = '';
  if (repo) {
    codeContext = await scanCodebaseContext(repo);
  }

  // ═══════════ PHASE 1: EXPLORER ═══════════
  console.log(`\n  ${COLORS.bgCyan}${COLORS.bold} PHASE 1: EXPLORER — QA Reconnaissance ${COLORS.reset}\n`);
  
  try {
    const explorer = new ExplorerAgent(apiKey);
    const task: BhrmshreeTask = {
      id: scanId,
      role: 'EXPLORER',
      phase: 'DISCOVERY',
      targetUrl: url,
      repoPath: repo,
      context: codeContext,
    };

    log('🚀 Deploying Explorer Agent to map functional targets...', 'qa');
    
    const plannedTests = await explorer.generateTestPlan(task);
    log(`📈 Generated ${plannedTests.length} dynamic test cases.`, 'qa');

    let passCount = 0;
    let failCount = 0;

    for (const testPlan of plannedTests) {
      log(`🧪 Running: ${testPlan.name}`, 'qa');
      const videoFileName = `phase1-${testPlan.id}-${Date.now()}.webm`;
      const videoPath = path.join(process.cwd(), 'dashboard', 'public', 'videos', scanId);
      await fs.mkdir(videoPath, { recursive: true });
      const fullVideoPath = path.join(videoPath, videoFileName);
      
      const result = await explorer.executeTest(url, testPlan, fullVideoPath);
      
      if (result.success) {
        log(`✅ Passed: ${testPlan.name}`, 'success');
        passCount++;
      } else {
        log(`❌ Failed: ${testPlan.name}`, 'error');
        log(`   └─ ${result.error}`, 'error');
        failCount++;
        allFindings.push({
          type: 'BUG',
          severity: testPlan.severity || 'MEDIUM',
          title: `QA Failure: ${testPlan.name}`,
          description: testPlan.description || 'Test failed during execution.',
          reproSteps: testPlan.steps.map((s: any) => `${s.type} ${s.selector || ''} ${s.payload || ''}`),
          location: url,
          screenshotUrl: `/videos/${scanId}/${videoFileName}`
        });
      }
    }
    
    log(`✅ Explorer Phase completed — ${passCount} passed, ${failCount} failed`, 'success');
  } catch (error: any) {
    log(`❌ Explorer failed: ${error.message}`, 'error');
  }

  // ═══════════ PHASE 2: SHADOW ═══════════
  console.log(`\n  ${COLORS.bgRed}${COLORS.bold} PHASE 2: SHADOW — Security Penetration ${COLORS.reset}\n`);
  
  let shadowResult: AgentResult | null = null;
  try {
    const shadow = new ShadowAgent(apiKey);
    const task: BhrmshreeTask = {
      id: scanId,
      role: 'SHADOW',
      phase: 'SECURITY_PROBE',
      targetUrl: url,
      repoPath: repo,
      context: codeContext,
    };

    const blueprint = {
      targets: [
        { location: url, type: 'main_page' },
        { location: `${url}/login`, type: 'auth_form' },
        { location: `${url}/api`, type: 'api_endpoint' },
      ],
    };

    log('🚀 Deploying Shadow Agent (Attack Mode)...', 'sec');
    shadowResult = await shadow.probe(task, blueprint);

    log(`✅ Shadow completed in ${(shadowResult.metrics.durationMs / 1000).toFixed(1)}s`, 'success');
    log(`🔥 Found ${shadowResult.findings.length} vulnerabilities`, 'sec');

    for (const finding of shadowResult.findings) {
      allFindings.push(finding);
    }
  } catch (error: any) {
    log(`❌ Shadow failed: ${error.message}`, 'error');
  }

  // ═══════════ PHASE 3: SWEEPER ═══════════
  console.log(`\n  ${COLORS.bgYellow}${COLORS.bold} PHASE 3: SWEEPER — Hidden Path Discovery ${COLORS.reset}\n`);
  
  let sweeperResult: AgentResult | null = null;
  try {
    const sweeper = new SweeperAgent(apiKey);
    const task: BhrmshreeTask = {
      id: scanId,
      role: 'EXPLORER',
      phase: 'VALIDATION',
      targetUrl: url,
      repoPath: repo,
      context: codeContext,
    };

    const blueprint = { techStack: 'Unknown (auto-detected)' };
    
    log('🚀 Deploying Sweeper Agent (Hyper-Guessing Mode)...', 'sec');
    sweeperResult = await sweeper.sweep(task, blueprint);

    log(`✅ Sweeper completed in ${(sweeperResult.metrics.durationMs / 1000).toFixed(1)}s`, 'success');
    log(`🔍 Found ${sweeperResult.findings.length} exposed paths`, 'sec');

    for (const finding of sweeperResult.findings) {
      allFindings.push(finding);
    }
  } catch (error: any) {
    log(`❌ Sweeper failed: ${error.message}`, 'error');
  }

  // ═══════════ FINAL REPORT ═══════════
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n  ${COLORS.bgMagenta}${COLORS.bold} ═══ SCAN COMPLETE — FINAL REPORT ═══ ${COLORS.reset}\n`);
  
  log(`⏱️  Total Time: ${COLORS.bold}${totalTime}s${COLORS.reset}`, 'system');
  log(`🔍 Total Findings: ${COLORS.bold}${allFindings.length}${COLORS.reset}`, 'system');
  
  const critical = allFindings.filter(f => f.severity === 'CRITICAL').length;
  const high = allFindings.filter(f => f.severity === 'HIGH').length;
  const medium = allFindings.filter(f => f.severity === 'MEDIUM').length;
  const low = allFindings.filter(f => f.severity === 'LOW').length;

  if (critical) log(`🔴 Critical: ${COLORS.bold}${critical}${COLORS.reset}`, 'system');
  if (high)     log(`🟠 High:     ${COLORS.bold}${high}${COLORS.reset}`, 'system');
  if (medium)   log(`🔵 Medium:   ${COLORS.bold}${medium}${COLORS.reset}`, 'system');
  if (low)      log(`🟢 Low:      ${COLORS.bold}${low}${COLORS.reset}`, 'system');

  if (allFindings.length === 0) {
    log('✨ No vulnerabilities or bugs found. The target appears secure.', 'success');
  } else {
    console.log(`\n  ${COLORS.bold}─── Detailed Findings ───${COLORS.reset}`);
    allFindings.forEach((f, i) => printFinding(f, i));
  }

  console.log(`\n  ${COLORS.gray}Bhrmshree Engine standing by.${COLORS.reset}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`\n  ${COLORS.bgRed} FATAL ${COLORS.reset} ${err.message}\n`);
  process.exit(1);
});
