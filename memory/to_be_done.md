# Bhrmshree SaaS: To-Be-Done

This document outlines the remaining features and architectural upgrades required to transition Bhrmshree from a working, cloud-synced prototype into a production-ready, revenue-generating SaaS business.

---

## 💳 Phase 4: Monetization (Stripe Billing)
Currently, any authenticated user can run unlimited scans on the backend. We need to implement billing and usage restrictions.

1.  **Stripe Integration**:
    *   Set up Stripe Webhooks in the Next.js API.
    *   Create a `subscriptions` and `credits` table in Supabase.
2.  **Billing Dashboard**:
    *   Build a `/dashboard/billing` page.
    *   Create UI for users to view their active plan, buy tier upgrades, or purchase "Pay-As-You-Go" scan credits.
3.  **Engine Guardrails**:
    *   Update the `pipeline-runner.ts` engine to verify the user has sufficient credits before allocating AI resources to a DevSecQA scan.

---

## 🐳 Phase 5: Scalable Architecture (Docker & Cloud Workers)
Currently, the backend engine runs locally using a standard Node process (`npx tsx serve`) over Port 4005 and controls a local instance of Playwright. To scale this for hundreds of concurrent customers, we must containerize it.

1.  **Dockerization**:
    *   Create a heavily optimized `Dockerfile` that packages Node.js, the Bhrmshree Engine codebase, and all required Playwright Chromium/WebKit binaries.
2.  **Serverless / Ephemeral Workers**:
    *   Deploy the container to AWS Fargate, Google Cloud Run, or Railway.
    *   When the Next.js `POST /api/scan` endpoint is hit via the UI, it should trigger a cloud task that dynamically spins up an ephemeral Docker container for that specific scan. The container will securely run the scan, upload videos/findings directly to Supabase, and elegantly terminate itself.

---

## 🖥️ Phase 6: UI Refinements & User Experience
The core Dashboard UI is built, but supporting views are needed for a complete user experience.

1.  **Scan History Table**:
    *   Fully implement the `/dashboard/history` page.
    *   Fetch all `scans` for the authenticated `user_id` from Supabase and display a rich data table detailing when the scan happened, status, total test cases, and discovered vulnerabilities.
2.  **In-Depth Report View**:
    *   Implement `/dashboard/scan/[id]` to allow users to dive deep into a specific historical scan.
3.  **Shareable Public Reports**:
    *   Allow a user to generate a masked, read-only public link for a DevSecQA run so they can easily share vulnerability evidence with their development team or executives.
4.  **Admin Panel**:
    *   Create a superuser dashboard (`/admin`) to oversee global platform metrics, active scans, and user signup data.
