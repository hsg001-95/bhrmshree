# Bhrmshree Project Memory

This document serves as the comprehensive memory and context repository for the Bhrmshree DevSecQA Platform. It contains all architectural details, historical context, and recent transformation steps up to March 20, 2026.

---

## 🏗️ Core Architecture & Concept

Bhrmshree is an autonomous "DevSecQA" SaaS platform that unifies functional Quality Assurance testing with automated Security Penetration Testing. It leverages **Gemini 3.1 Pro** for AI reasoning and **Playwright** for browser automation.

The engine operates using three specialized AI agents:
1. **The Explorer (QA Agent)**: Maps the functional "Happy Path" of the application, navigating menus, logging in, and executing basic workflows to ensure the application works as intended. It records videos of its execution for QA verification.
2. **The Shadow (Security Agent)**: Uses the Explorer's map to identify input vectors and API endpoints. It then launches targeted, multi-turn application logic attacks (SQLi, XSS, SSRF, IDOR, Workflow manipulation).
3. **The Sweeper (Assurance Agent)**: Performs intelligent "hyper-guessing" to find hidden directories, exposed `.env` variables, `.git` leaks, and exposed admin panels.

---

## ☁️ The SaaS Transformation (March 2026)

Originally a CLI-only tool, Bhrmshree was transformed into a multi-user, cloud-synced SaaS application to support a scalable business model (similar to TestSprite).

### 1. Database & Infrastructure (Supabase)
We integrated **Supabase** (PostgreSQL + Auth + Storage) as the cloud backend, ensuring that scans and reports are no longer just local JSON files, but live database records tied to authenticated users.

The Supabase schema includes:
*   **`profiles`**: User profiles with triggers to auto-create on signup.
*   **`scans`**: Tracks each scan's status, target URL, local repo path, timestamp, and the `user_id` of the initiator.
*   **`test_cases`**: Live upserts from the Explorer/Shadow agents with test steps, status (passed/failed), and logs.
*   **`findings`**: Specific bug or vulnerability records with severity, titles, and descriptions.
*   **`api_keys`**: For future programmatic access.

### 2. The Cloud Media Pipeline
Previously, Playwright videos were saved to the local `dashboard/public/videos` folder. 
We created a **public Supabase Storage bucket (`scans`)**. Now, as the Explorer generates test execution videos, the Node.js backend immediately uploads them to the cloud bucket and assigns the public URL to the test case in PostgreSQL.

### 3. The Decoupled Dashboard (Next.js)
We separated the Next.js visual dashboard from the Node.js AI Engine to support true cloud scaling and Next.js SSR Auth.
*   **Next.js Dashboard (`dashboard/`)**: A premium UI with glassmorphism, landing pages, pricing tiers, and a real-time scan monitoring interface. It requires Supabase login. When a user starts a scan, it creates the DB record directly.
*   **Node.js Engine API (`engine/`)**: The core AI logic, now exposed as a REST API on **Port 4005**. The dashboard connects here via WebSocket (`socket.io`) and HTTP POST to trigger heavy background processing.
*   **Concurrent Startup**: Updated `bhrmshree-dashboard.bat` to automatically spin up both the dashboard (port 4004) and the engine (port 4005) simultaneously.

### 4. The MCP Server (IDE Integration)
To enable developers to run scans from within modern IDEs (Cursor, Windsurf), we built a native Node.js Model Context Protocol (MCP) server.
*   Located in `mcp/` and built with `@modelcontextprotocol/sdk`.
*   **Tools Exposed**:
    *   `bhrmshree_bootstrap`: Checks backend connectivity.
    *   `bhrmshree_trigger_scan`: Passes the IDE's local workspace directory (`repoPath`) to the Next.js Engine API to initiate a White-Box DevSecQA scan natively.
    *   `bhrmshree_get_status`: Pulls live finding updates and test execution progress directly back into the IDE chat box.

---

## 📁 Repository Structure Snapshot

*   `engine/`: Core Node.js AI engine.
    *   `server.ts`: Express API server (port 4005).
    *   `pipeline-runner.ts`: Orchestrator that controls agents and syncs live data to Supabase.
    *   `agents/`: `explorer.ts`, `shadow.ts`, `sweeper.ts` AI logic.
    *   `automation/browser.ts`: Playwright logic.
*   `dashboard/`: Next.js App Router UI.
    *   `src/app/page.tsx`: Marketing landing page.
    *   `src/app/login/`, `src/app/signup/`: Auth pages.
    *   `src/app/dashboard/`: The authenticated SaaS interactive matrix.
    *   `src/app/globals.css`: Premium CSS framework and animations.
*   `mcp/`: Standalone MCP Server for Cursor/Windsurf.
    *   `index.ts`: The MCP Tool definitions and fetch logic.
*   `supabase/`: Contains `migration.sql` with all RLS and Schema definitions.
*   `bhrmshree-dashboard.bat`: Core Windows runner script for deploying the entire stack locally.
*   `bhrmshree.ts`: The original CLI entrypoint for headless environments.
*   `memory/`: (This folder) containing persistent project knowledge.

---

## 🚀 Ongoing / Future Plans
*   **Phase 4**: Implement Stripe Billing into the Next.js UI for subscription-based access.
*   **Phase 5**: Full containerization (Docker) of the Playwright workers to decouple the engine execution from the host machine completely.
*   **Extensibility**: Build an admin view to manage all users and global findings across the SaaS network.
