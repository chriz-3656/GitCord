import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface AIProvider {
  generateContent(prompt: string): Promise<string>;
  isAvailable(): boolean;
  getName(): string;
}

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any;

  constructor(apiKey: string | undefined) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini provider error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.model !== null;
  }

  getName(): string {
    return 'gemini';
  }
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI | null = null;

  constructor(apiKey: string | undefined) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async generateContent(prompt: string): Promise<string> {
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
    } catch (error) {
      console.error('OpenAI provider error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getName(): string {
    return 'openai';
  }
}

export class AIProviderFactory {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider | null;

  constructor(
    primaryProvider: AIProvider,
    fallbackProvider: AIProvider | null = null
  ) {
    this.primaryProvider = primaryProvider;
    this.fallbackProvider = fallbackProvider;
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      if (!this.primaryProvider.isAvailable()) {
        throw new Error(`${this.primaryProvider.getName()} is not available`);
      }

      return await this.primaryProvider.generateContent(prompt);
    } catch (primaryError) {
      console.warn(
        `Primary provider (${this.primaryProvider.getName()}) failed:`,
        primaryError
      );

      if (this.fallbackProvider && this.fallbackProvider.isAvailable()) {
        try {
          console.log(
            `Falling back to ${this.fallbackProvider.getName()} provider`
          );
          return await this.fallbackProvider.generateContent(prompt);
        } catch (fallbackError) {
          console.error(
            `Fallback provider (${this.fallbackProvider.getName()}) also failed:`,
            fallbackError
          );
          throw new Error(
            'All AI providers failed. Please try again later.'
          );
        }
      }

      throw primaryError;
    }
  }

  getPrimaryProviderName(): string {
    return this.primaryProvider.getName();
  }

  getFallbackProviderName(): string | null {
    return this.fallbackProvider?.getName() ?? null;
  }
}
