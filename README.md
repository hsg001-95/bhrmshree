# 🛡️ Bhrmshree: Unified Autonomous Testing & Security Engine

Bhrmshree is a next-generation "DevSecQA" platform that merges **Autonomous QA (Functional Testing)** and **Autonomous Pentesting (Security)** into a single, intelligent workflow powered by **Gemini 3.1 Pro** and **Playwright**.

Instead of scanning blindly, Bhrmshree autonomously navigates your web application to understand its functional "Happy Path" (like a real user), and then weaponizes that understanding to launch surgical, high-impact security attacks.

---

## 🧠 Core Architecture: "Hacking the Happy Path"

The Bhrmshree engine is powered by three specialized AI agents working in sequence:

1. 🧭 **The Explorer (QA Agent)**:
   - Uses AI to map out navigation menus, login forms, and user workflows.
   - Generates and executes a dynamic Playwright test suite to validate the functional "Happy Path".
   - Records videos of its sessions for visual QA verification.
   
2. 🥷 **The Shadow (Security Agent)**:
   - Uses the Explorer's functional map as a blueprint.
   - Performs multi-turn, intelligent exploitation logic targeting the discovered inputs.
   - Attempts SQLi, XSS, SSRF, IDOR, and advanced Workflow Attacks (e.g., "Add to cart -> Modify price -> Checkout").
   
3. 🧹 **The Sweeper (Assurance Agent)**:
   - Performs AI-driven "Hyper-Guessing" to discover hidden paths and exposed environment variables.
   - Looks for `.git` leaks, exposed `.env` configs, debug metrics, and admin panels.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v20+)
- **Google AI API Key** (for Gemini 3.1 Pro capabilities)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yashh1321/Bhrmshree.git
   cd Bhrmshree
   npm install
   ```
2. Configure your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your GOOGLE_AI_API_KEY
   ```

---

## 💻 Usage & CLI Reference

Bhrmshree can operate in a fast, CLI-only mode or via an interactive real-time visual dashboard.

### 1. The Interactive Dashboard
Run the platform through the live UI (Recommended):
```bash
# On Windows
bhrmshree-dashboard.bat

# Or manually:
npm run dev --prefix dashboard
npx tsx bhrmshree.ts serve
```
*Navigating to `http://localhost:4004` will show the live dashboard, where you can initiate scans, watch the browser sessions in real-time, and view findings.*

### 2. The CLI Mode
Run a complete DevSecQA pipeline directly from the terminal.

**Black-Box Scan:**
```bash
npx tsx bhrmshree.ts start URL=https://example.com
```

**White-Box Scan (with local Codebase Context):**
```bash
npx tsx bhrmshree.ts start URL=https://example.com REPO=/path/to/local/source
```

---

## 📊 Outputs & Reports
- **Visual Evidence**: Videos and screenshots of discovered bugs and vulnerabilities are automatically saved to `dashboard/public/videos/` and `dashboard/public/screenshots/`.
- **Unified Reporting**: Combines broken UI/QA flows with confirmed Security vulnerabilities into a single prioritized report.

---

**Bhrmshree: Hacking the Happy Path.**
