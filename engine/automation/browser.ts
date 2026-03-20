import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

/**
 * Playwright Browser Wrapper for Bhrmshree.
 * Provides a simplified interface for Gemini to interact with websites.
 */
export class BhrmshreeBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private consoleLogs: string[] = [];

  /**
   * Initialize a fresh browser session.
   */
  async start(headless: boolean = true): Promise<void> {
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    this.page = await this.context.newPage();
    
    // Capture console logs globally
    this.page.on('console', msg => this.consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  }

  /**
   * Navigate to a URL and wait for it to be stable.
   */
  async navigate(url: string): Promise<{ durationMs: number }> {
    if (!this.page) throw new Error('Browser not started');
    const start = Date.now();
    try {
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    } catch {
      // Timeout is okay — some pages never reach network idle
    }
    return { durationMs: Date.now() - start };
  }

  /**
   * Extract "Hidden" state from the client (localStorage, sessionStorage, window variables).
   */
  async getClientState(): Promise<any> {
    if (!this.page) throw new Error('Browser not started');
    try {
      return await this.page.evaluate(() => {
        return {
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage },
          windowVars: Object.keys(window).filter(k => k.includes('API') || k.includes('CONFIG') || k.includes('STATE')),
        };
      });
    } catch {
      return { localStorage: {}, sessionStorage: {}, windowVars: [] };
    }
  }

  /**
   * Capture a snapshot — page title, URL, visible text, and client state.
   */
  async getSnapshot(): Promise<{ screenshot: Buffer; accessibilityTree: any; clientState: any; consoleLogs: string[] }> {
    if (!this.page) throw new Error('Browser not started');

    const screenshot = await this.page.screenshot();
    
    // Use page content and title instead of deprecated accessibility.snapshot()
    const title = await this.page.title();
    const url = this.page.url();
    const bodyText = await this.page.evaluate(() => document.body?.innerText?.substring(0, 3000) || '');
    const links = await this.page.evaluate(() => 
      Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: (a as HTMLAnchorElement).innerText.trim().substring(0, 50),
        href: (a as HTMLAnchorElement).href,
      })).slice(0, 30)
    );
    const forms = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || el.getAttribute('id') || '',
        placeholder: el.getAttribute('placeholder') || '',
      })).slice(0, 20)
    );

    const accessibilityTree = { title, url, bodyText: bodyText.substring(0, 1000), links, forms };
    const clientState = await this.getClientState();
    const logs = [...this.consoleLogs];
    this.consoleLogs = []; // Clear after reading

    return { screenshot, accessibilityTree, clientState, consoleLogs: logs };
  }

  /**
   * Perform actions on the page.
   */
  async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not started');
    try {
      await this.page.click(selector, { timeout: 5000 });
      await this.page.waitForLoadState('networkidle').catch(() => {});
    } catch (e: any) {
      console.log(`[Browser] Click failed on "${selector}": ${e.message}`);
    }
  }

  async type(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('Browser not started');
    try {
      await this.page.fill(selector, text);
    } catch (e: any) {
      console.log(`[Browser] Type failed on "${selector}": ${e.message}`);
    }
  }

  /**
   * Close the browser session.
   */
  async stop(): Promise<void> {
    if (this.browser) {
      try { await this.browser.close(); } catch {}
    }
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Run a specific array of steps in an isolated context and record a video.
   */
  async runTestWithVideo(targetUrl: string, steps: any[], outputVideoPath: string): Promise<{ success: boolean; error?: string }> {
    let tempBrowser: Browser | null = null;
    try {
      tempBrowser = await chromium.launch({ headless: true });
      const tempContext = await tempBrowser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        recordVideo: {
          dir: path.dirname(outputVideoPath),
          size: { width: 1280, height: 720 }
        }
      });
      const tempPage = await tempContext.newPage();
      
      // Navigate to starting URL
      await tempPage.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      await tempPage.waitForTimeout(1000); // 1s buffer for the video to start smoothly
      
      // Execute steps
      for (const step of steps) {
        try {
          if (step.type === 'CLICK') {
            await tempPage.click(step.selector, { timeout: 5000 });
          } else if (step.type === 'TYPE') {
            await tempPage.fill(step.selector, step.payload);
          } else if (step.type === 'NAVIGATE') {
            await tempPage.goto(step.payload, { waitUntil: 'networkidle', timeout: 15000 });
          }
        } catch (stepErr: any) {
          console.log(`[Browser] Step failed during recording: ${stepErr.message}`);
          // Continue recording to capture the error state
        }
        // Small pause between actions for watchability
        await tempPage.waitForTimeout(800);
      }
      
      // Post-test buffer
      await tempPage.waitForLoadState('networkidle').catch(() => {});
      await tempPage.waitForTimeout(1500); 
      
      // Get the video object BEFORE closing the context in Playwright 1.x
      const video = tempPage.video();
      const tempPath = await video?.path();
      
      // Closing the context flushes the video to disk
      await tempContext.close(); 
      await tempBrowser.close();
      
      // Rename the temporary playwright WebM file to our target filename
      if (tempPath) {
        await fs.rename(tempPath, outputVideoPath);
      }
      
      return { success: true };
    } catch (e: any) {
      if (tempBrowser) await tempBrowser.close().catch(() => {});
      return { success: false, error: e.message };
    }
  }
}
