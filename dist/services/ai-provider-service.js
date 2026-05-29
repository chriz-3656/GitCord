import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
export class GeminiProvider {
    genAI = null;
    model;
    constructor(apiKey) {
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }
    async generateContent(prompt) {
        if (!this.model) {
            throw new Error('Gemini API key not configured');
        }
        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            console.error('Gemini provider error:', error);
            throw error;
        }
    }
    isAvailable() {
        return this.model !== null;
    }
    getName() {
        return 'gemini';
    }
}
export class OpenAIProvider {
    client = null;
    constructor(apiKey) {
        if (apiKey) {
            this.client = new OpenAI({ apiKey });
        }
    }
    async generateContent(prompt) {
        if (!this.client) {
            throw new Error('OpenAI API key not configured');
        }
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });
            const textContent = response.choices[0].message.content;
            if (!textContent) {
                throw new Error('Empty response from OpenAI');
            }
            return textContent;
        }
        catch (error) {
            console.error('OpenAI provider error:', error);
            throw error;
        }
    }
    isAvailable() {
        return this.client !== null;
    }
    getName() {
        return 'openai';
    }
}
export class AIProviderFactory {
    primaryProvider;
    fallbackProvider;
    constructor(primaryProvider, fallbackProvider = null) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
    }
    async generateContent(prompt) {
        try {
            if (!this.primaryProvider.isAvailable()) {
                throw new Error(`${this.primaryProvider.getName()} is not available`);
            }
            return await this.primaryProvider.generateContent(prompt);
        }
        catch (primaryError) {
            console.warn(`Primary provider (${this.primaryProvider.getName()}) failed:`, primaryError);
            if (this.fallbackProvider && this.fallbackProvider.isAvailable()) {
                try {
                    console.log(`Falling back to ${this.fallbackProvider.getName()} provider`);
                    return await this.fallbackProvider.generateContent(prompt);
                }
                catch (fallbackError) {
                    console.error(`Fallback provider (${this.fallbackProvider.getName()}) also failed:`, fallbackError);
                    throw new Error('All AI providers failed. Please try again later.');
                }
            }
            throw primaryError;
        }
    }
    getPrimaryProviderName() {
        return this.primaryProvider.getName();
    }
    getFallbackProviderName() {
        return this.fallbackProvider?.getName() ?? null;
    }
}
//# sourceMappingURL=ai-provider-service.js.map