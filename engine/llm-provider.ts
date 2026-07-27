import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

export type AIProvider = 'gemini' | 'anthropic';

/**
 * High-Efficiency Multi-Provider LLM Router.
 * Centralizes AI logic for Bhrmshree, supporting Gemini 3 Flash for QA/Sweeping
 * and Claude 4.6 Sonnet/Opus for deep Security reasoning.
 */
export class LlmProvider {
  private genAI: GoogleGenerativeAI;
  private anthropic: Anthropic;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GITHUB_API_KEY || '');
    this.anthropic = new Anthropic({ 
      apiKey: process.env.GITHUB_API_KEY || 'missing-key' 
    });
  }

  /**
   * Run a prompt through either Gemini or Claude.
   * @param prompt The system/user instructions.
   * @param provider 'gemini' | 'anthropic'
   * @param modelName e.g., 'gemini-3.0-flash', 'claude-4.6-sonnet'
   */
  async runPrompt(prompt: string, provider: AIProvider, modelName: string): Promise<string> {
    if (provider === 'gemini') {
      return this.runGemini(prompt, modelName);
    } else {
      return this.runAnthropic(prompt, modelName);
    }
  }

  private async runGemini(prompt: string, modelName: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        const is429 = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests');
        if (is429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`  [LLM] ⏳ Rate limited (Gemini 429). Retrying in ${(delay / 1000).toFixed(1)}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`Gemini Provider Error: ${error.message}`);
      }
    }
    throw new Error('Max retries exceeded for Gemini API');
  }

  private async runAnthropic(prompt: string, modelName: string): Promise<string> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const message = await this.anthropic.messages.create({
          model: modelName,
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }]
        });
        
        // Anthropic v4 returns an array of content blocks. We just want the text.
        const contentBlock = message.content.find(b => b.type === 'text');
        if (contentBlock && contentBlock.type === 'text') {
           return contentBlock.text;
        }
        return '';
      } catch (error: any) {
        // Handle Anthropic Rate limits (429) mostly.
        if (error.status === 429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`  [LLM] ⏳ Rate limited (Anthropic 429). Retrying in ${(delay / 1000).toFixed(1)}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`Anthropic Provider Error: ${error.message}`);
      }
    }
    throw new Error('Max retries exceeded for Anthropic API');
  }
}
