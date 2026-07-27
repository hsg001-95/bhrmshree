/**
 * Playwright Browser Wrapper for Bhrmshree.
 * Provides a simplified interface for Gemini to interact with websites.
 */
export declare class BhrmshreeBrowser {
    private browser;
    private context;
    private page;
    /**
     * Initialize a fresh browser session.
     */
    start(headless?: boolean): Promise<void>;
    /**
     * Navigate to a URL and wait for it to be stable.
     */
    navigate(url: string): Promise<{
        durationMs: number;
    }>;
    /**
     * Extract "Hidden" state from the client (localStorage, sessionStorage, window variables).
     */
    getClientState(): Promise<any>;
    /**
     * Capture a snapshot with extra "Security Eyes" (Console logs and Network timings).
     */
    getSnapshot(): Promise<{
        screenshot: Buffer;
        accessibilityTree: any;
        clientState: any;
        consoleLogs: string[];
    }>;
    /**
     * Perform an action on the page.
     */
    click(selector: string): Promise<void>;
    type(selector: string, text: string): Promise<void>;
    /**
     * Close the browser session.
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=browser.d.ts.map