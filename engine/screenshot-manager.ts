import fs from 'fs/promises';
import path from 'path';

/**
 * Screenshot Manager for Bhrmshree.
 * Saves screenshots to the dashboard public directory so they can be served
 * as static files by the Next.js dev server or the engine's Express server.
 */
export class ScreenshotManager {
  private baseDir: string;

  constructor() {
    // Screenshots go inside the dashboard's public directory
    this.baseDir = path.join(process.cwd(), 'dashboard', 'public', 'screenshots');
  }

  /**
   * Ensure the screenshot directory exists for a given scan.
   */
  private async ensureDir(scanId: string): Promise<string> {
    const dir = path.join(this.baseDir, scanId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  /**
   * Save a screenshot buffer and return the URL path for the dashboard.
   * @returns The URL path (e.g., `/screenshots/scan-123/explorer-test-1.png`)
   */
  async saveScreenshot(
    scanId: string,
    phase: 'explorer' | 'shadow' | 'sweeper',
    testId: string,
    buffer: Buffer
  ): Promise<string> {
    const dir = await this.ensureDir(scanId);
    const filename = `${phase}-${testId}.png`;
    const filePath = path.join(dir, filename);
    
    await fs.writeFile(filePath, buffer);
    
    // Return the URL path relative to the dashboard's public dir
    return `/screenshots/${scanId}/${filename}`;
  }

  /**
   * Save a base64-encoded screenshot.
   */
  async saveScreenshotBase64(
    scanId: string,
    phase: 'explorer' | 'shadow' | 'sweeper',
    testId: string,
    base64Data: string
  ): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    return this.saveScreenshot(scanId, phase, testId, buffer);
  }

  /**
   * Clean up screenshots for a specific scan.
   */
  async cleanupScan(scanId: string): Promise<void> {
    const dir = path.join(this.baseDir, scanId);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
  }

  /**
   * Clean up all screenshot data older than maxAgeMs.
   */
  async cleanupOld(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
      const now = Date.now();

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const dirPath = path.join(this.baseDir, entry.name);
          const stat = await fs.stat(dirPath);
          if (now - stat.mtimeMs > maxAgeMs) {
            await fs.rm(dirPath, { recursive: true, force: true });
          }
        }
      }
    } catch {
      // Base directory might not exist yet
    }
  }
}
