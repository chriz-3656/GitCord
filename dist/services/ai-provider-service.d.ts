export interface AIProvider {
    generateContent(prompt: string): Promise<string>;
    isAvailable(): boolean;
    getName(): string;
}
export declare class GeminiProvider implements AIProvider {
    private genAI;
    private model;
    constructor(apiKey: string | undefined);
    generateContent(prompt: string): Promise<string>;
    isAvailable(): boolean;
    getName(): string;
}
export declare class OpenAIProvider implements AIProvider {
    private client;
    constructor(apiKey: string | undefined);
    generateContent(prompt: string): Promise<string>;
    isAvailable(): boolean;
    getName(): string;
}
export declare class AIProviderFactory {
    private primaryProvider;
    private fallbackProvider;
    constructor(primaryProvider: AIProvider, fallbackProvider?: AIProvider | null);
    generateContent(prompt: string): Promise<string>;
    getPrimaryProviderName(): string;
    getFallbackProviderName(): string | null;
}
