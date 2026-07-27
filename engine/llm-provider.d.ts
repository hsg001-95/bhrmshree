/**
 * High-Efficiency LLM Provider for Gemini.
 * Centralizes all AI logic for Bhrmshree, enabling 2M context window for QA and Security.
 */
export declare class LlmProvider {
    private genAI;
    constructor(apiKey: string);
    /**
     * Run a prompt through Gemini.
     * @param prompt The system/user instructions.
     * @param modelName Defaults to Gemini 3.1 Pro for agentic workflows.
     */
    runPrompt(prompt: string, modelName?: string): Promise<string>;
}
//# sourceMappingURL=llm-provider.d.ts.map