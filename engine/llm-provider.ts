import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * High-Efficiency LLM Provider for Gemini.
 * Centralizes all AI logic for Bhrmshree, enabling 2M context window for QA and Security.
 */
export class LlmProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Run a prompt through Gemini. 
   * @param prompt The system/user instructions.
   * @param modelName Defaults to Gemini 3.1 Pro Preview for maximum capability.
   */
  async runPrompt(prompt: string, modelName: string = 'gemini-3.1-pro-preview'): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      // Safety settings configured for Security Testing (allows analyzing payloads)
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
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
          // Standard exponential backoff: 2s, 4s, 8s...
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`  [LLM] ⏳ Rate limited (429). Retrying in ${(delay / 1000).toFixed(1)}s... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded for Gemini API');
  }
}
