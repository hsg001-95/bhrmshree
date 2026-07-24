# 🛡️ Bhrmshree: Unified Autonomous Testing & Security Engine

Bhrmshree is a next-generation "DevSecQA" platform that merges **Autonomous QA (Functional Testing)** and **Autonomous Pentesting (Security)** into a single, intelligent workflow powered by **Gemini 3.1 Pro**.

---

## 🧠 The Philosophy: "Hacking the Happy Path"
Traditional security tools scan blindly. Bhrmshree is different. 
1.  **The Explorer (QA)**: First, it learns how a human uses your app. It clicks buttons, fills forms, and maps the "Happy Path."
2.  **The Shadow (Security)**: It then uses that "Happy Path" as a blueprint. It knows exactly which inputs lead to the database and which pages reflect data, allowing it to launch surgical, high-impact attacks.

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Node.js**: v20 or higher.
- **Temporal Server**: Bhrmshree uses Temporal for reliable workflow orchestration.
  - Install via Docker: `docker compose up -d temporal` (or use a cloud instance).
- **Google AI API Key**: Required for Gemini 3.1 Pro.

### 2. Installation
```bash
cd /home/Yash/bhrmshree-ai
npm install
```

### 3. Configuration
Copy the template and add your API key:
```bash
cp .env.example .env
nano .env
```
*Make sure `GITHUB_API_KEY` is set correctly.*

---

## 💻 CLI Reference (`./bhrmshree`)

The `./bhrmshree` script is your primary command center.

### `start` - Launch a New Scan
This is the most common command. It triggers a full "Explorer + Shadow" cycle.
```bash
./bhrmshree start URL=<target_url> REPO=<path_to_code> [ONLY=<agents>]
```
- **URL**: The live website to test (e.g., `https://myapp.com`).
- **REPO**: The local path to the application's source code. This allows the AI to perform "white-box" analysis.
- **ONLY** (Optional): Focus on specific vulnerabilities (e.g., `ONLY=xss,injection`).

### `dashboard` - Visual Monitoring
Launch the Next.js Web UI to watch the AI work in real-time.
```bash
./bhrmshree dashboard
```
- **Visual Browser**: See exactly what the AI sees.
- **Real-time Logs**: Watch vulnerabilities being discovered as they happen.
- **Interactive Reports**: Browse and export the final security/QA findings.

### `status` - Check Progress
Check the current state of a running scan.
```bash
./bhrmshree status ID=<scan-id>
```
- Shows the current phase (Discovery, Security Probe, or Reporting).
- Displays a count of discovered endpoints and confirmed vulnerabilities.

### `stop` - Terminate Agents
Gracefully stop all running agents and close browser sessions.
```bash
./bhrmshree stop
```

---

## 🛠️ The Agentic Workflow

### Phase 1: Discovery (The Explorer)
The Explorer agent uses **Gemini 3.1 Pro** to "crawl" your site.
- It identifies navigation menus, login forms, and user profiles.
- It fills forms with realistic data to find hidden pages.
- **Output**: A `blueprint.json` mapping every functional route.

### Phase 2: Security Probe (The Shadow)
The Shadow agent "shadows" the Explorer's path.
- It targets the inputs found by the Explorer.
- It performs **Workflow Attacks**: e.g., "Add to cart -> Modify price -> Checkout."
- **Output**: A list of confirmed exploits (SQLi, XSS, SSRF, IDOR).

### Phase 3: Reporting
Bhrmshree merges the QA bugs (e.g., "Login button doesn't work") and Security flaws (e.g., "Login is vulnerable to SQLi") into a **Unified DevSecQA Report**.

---

## 🆘 Troubleshooting
- **Browser Issues**: Ensure Playwright is installed: `npx playwright install chromium`.
- **Temporal Connection**: Check if your Temporal server is reachable at the address in your `.env`.
- **API Errors**: Ensure your Gemini API key has sufficient quota for Gemini 3.1 Pro.

---
**Bhrmshree: Hacking the Happy Path.**
