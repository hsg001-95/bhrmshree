"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BhrmshreeBrowser = void 0;
const playwright_1 = require("playwright");
/**
 * Playwright Browser Wrapper for Bhrmshree.
 * Provides a simplified interface for Gemini to interact with websites.
 */
class BhrmshreeBrowser {
    browser = null;
    context = null;
    page = null;
    /**
     * Initialize a fresh browser session.
     */
    async start(headless = true) {
        this.browser = await playwright_1.chromium.launch({ headless });
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            // Important for many modern sites to prevent bot detection
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        this.page = await this.context.newPage();
    }
    /**
     * Navigate to a URL and wait for it to be stable.
     */
    async navigate(url) {
        if (!this.page)
            throw new Error('Browser not started');
        const start = Date.now();
        await this.page.goto(url, { waitUntil: 'networkidle' });
        return { durationMs: Date.now() - start };
    }
    /**
     * Extract "Hidden" state from the client (localStorage, sessionStorage, window variables).
     */
    async getClientState() {
        if (!this.page)
            throw new Error('Browser not started');
        return await this.page.evaluate(() => {
            return {
                localStorage: { ...localStorage },
                sessionStorage: { ...sessionStorage },
                windowVars: Object.keys(window).filter(k => k.includes('API') || k.includes('CONFIG') || k.includes('STATE')),
            };
        });
    }
    /**
     * Capture a snapshot with extra "Security Eyes" (Console logs and Network timings).
     */
    async getSnapshot() {
        if (!this.page)
            throw new Error('Browser not started');
        const consoleLogs = [];
        this.page.on('console', msg => consoleLogs.push(msg.text()));
        const screenshot = await this.page.screenshot();
        const accessibilityTree = await this.page.accessibility.snapshot();
        const clientState = await this.getClientState();
        return { screenshot, accessibilityTree, clientState, consoleLogs };
    }
    /**
     * Perform an action on the page.
     */
    async click(selector) {
        if (!this.page)
            throw new Error('Browser not started');
        await this.page.click(selector);
        await this.page.waitForLoadState('networkidle');
    }
    async type(selector, text) {
        if (!this.page)
            throw new Error('Browser not started');
        await this.page.fill(selector, text);
    }
    /**
     * Close the browser session.
     */
    async stop() {
        if (this.browser)
            await this.browser.close();
    }
}
exports.BhrmshreeBrowser = BhrmshreeBrowser;
//# sourceMappingURL=browser.js.map