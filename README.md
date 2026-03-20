# Bhrmshree: The Unified Autonomous Testing & Security Engine

Bhrmshree is a next-generation "DevSecQA" engine that autonomously learns how to use your web application (QA) and then uses that knowledge to identify and exploit security vulnerabilities (Pentesting).

## 🛡️ Core Concepts
- **Autonomous Explorer (QA)**: Navigates the UI, builds a functional map, and validates the "Happy Path."
- **Autonomous Shadow (Security)**: Uses the functional map to probe for common and advanced security flaws (Injection, XSS, SSRF, IDOR).
- **Unified Verifier**: Ensures that security fixes don't break functionality.

## 🏗️ Architecture
- **Engine**: Orchestrated by **Temporal.io** for reliable, long-running agent workflows.
- **Automation**: Powered by **Playwright** for high-fidelity browser interaction.
- **Intelligence**: Integrated with **Anthropic Claude 3.5 Sonnet** and **Gemini 2.0 Flash**.
- **Dashboard**: A real-time **Next.js** interface for visual monitoring.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Temporal Server (running locally or in the cloud)
- Anthropic or OpenRouter API Key

### Installation
1. `npm install`
2. Copy `.env.example` to `.env` and fill in your keys.

### Running a Scan
`./bhrmshree start URL=https://example.com REPO=/path/to/source`
