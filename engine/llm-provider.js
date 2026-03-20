"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * High-Efficiency LLM Provider for Gemini.
 * Centralizes all AI logic for Bhrmshree, enabling 2M context window for QA and Security.
 */
class LlmProvider {
    genAI;
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    /**
     * Run a prompt through Gemini.
     * @param prompt The system/user instructions.
     * @param modelName Defaults to Gemini 3.1 Pro for agentic workflows.
     */
    async runPrompt(prompt, modelName = 'gemini-3.1-pro-latest') {
        const model = this.genAI.getGenerativeModel({
            model: modelName,
            // Safety settings configured for Security Testing (allows analyzing payloads)
            safetySettings: [
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
exports.LlmProvider = LlmProvider;
//# sourceMappingURL=llm-provider.js.map