# 🛡️ Bhrmshree: Unified Autonomous Testing & Security SaaS

Bhrmshree is a next-generation "DevSecQA" SaaS platform that merges **Autonomous QA (Functional Testing)** and **Autonomous Pentesting (Security)** into a single, intelligent workflow powered by **Gemini 3.1 Pro** and **Playwright**.

Instead of scanning blindly, Bhrmshree autonomously navigates your web application to understand its functional "Happy Path" (like a real user), and then weaponizes that knowledge to launch surgical, high-impact security attacks.

---

## ☁️ SaaS Architecture (New!)

Bhrmshree has been upgraded from a local CLI tool into a fully cloud-synced SaaS platform:
- **Next.js Dashboard**: A premium, Server-Side Rendered (SSR) web interface.
- **Supabase Integration**: Live synchronization of scans, test cases, and vulnerability findings to a cloud PostgreSQL database.
- **Cloud Video Storage**: Playwright test executions are automatically recorded and uploaded to Supabase Storage.
- **Decoupled Engine**: The core AI engine runs as a standalone Node.js API, communicating with the frontend in real-time.

---

## 🧠 Core Engine: "Hacking the Happy Path"

The Bhrmshree engine is powered by three specialized AI agents working in sequence:

1. 🧭 **The Explorer (QA Agent)**
   - Uses AI to map out navigation menus, login forms, and user workflows.
   - Generates and executes a dynamic Playwright test suite to validate the functional "Happy Path".
   - Records videos of its sessions for visual QA verification and uploads them to the cloud.
   
2. 🥷 **The Shadow (Security Agent)**
   - Uses the Explorer's functional map as a blueprint.
   - Performs multi-turn, intelligent exploitation logic targeting the discovered inputs.
   - Attempts SQLi, XSS, SSRF, IDOR, and advanced Workflow Attacks (e.g., "Add to cart -> Modify price -> Checkout").
   
3. 🧹 **The Sweeper (Assurance Agent)**
   - Performs AI-driven "Hyper-Guessing" to discover hidden paths and exposed environment variables.
   - Looks for `.git` leaks, exposed `.env` configs, debug metrics, and admin panels.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v20+)
- **GitHub API Key** (for Gemini and Claude models capabilities)
- **Supabase Project** (Free tier works perfectly)

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Open the SQL Editor and run the provided migration script located at `supabase/migration.sql`.
3. Go to Storage and create a new public bucket named `scans`.

### 2. Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yashh1321/Bhrmshree.git
   cd Bhrmshree
   npm install
   cd dashboard && npm install && cd ..
   ```
2. Configure environment variables in the dashboard:
   ```bash
   # Create a .env.local file in the dashboard directory:
   # dashboard/.env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GITHUB_API_KEY=your-github-api-key
   ```

---

## 💻 Usage & SaaS Platform

Run the unified SaaS platform locally for development and testing.

### Starting the Platform
We provide a simple Windows batch script that concurrently starts the Next.js UI and the Backend Engine API:

```bash
bhrmshree-dashboard.bat
```

*(This will launch the Dashboard on **port 4004** and the API Engine on **port 4005**)*

1. Navigate to `http://localhost:4004`
2. **Sign up / Log in** using the Supabase Auth flows.
3. Paste a Target URL and initiate a scan.
4. Watch the agents work in real-time as the matrix populates with live discovery and security probe results.

### Local CLI Mode (Legacy)
You can still run a complete DevSecQA pipeline directly from the terminal without the web interface.

**Black-Box Scan:**
```bash
npx tsx bhrmshree.ts start URL=https://example.com
```

**White-Box Scan (with local Codebase Context):**
```bash
npx tsx bhrmshree.ts start URL=https://example.com REPO=/path/to/local/source
```

---

**Bhrmshree: Hacking the Happy Path.**
