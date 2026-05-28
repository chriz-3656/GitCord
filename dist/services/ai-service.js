import { GoogleGenerativeAI } from '@google/generative-ai';
export class AIService {
    static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    static model = AIService.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    static async summarizePR(title, body) {
        if (!process.env.GEMINI_API_KEY)
            return null;
        try {
            const prompt = `Summarize this GitHub Pull Request in 2 sentences. 
      Title: ${title}
      Description: ${body}`;
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            console.error('Error generating AI summary:', error);
            return null;
        }
    }
    static async analyzeIssue(title, body) {
        if (!process.env.GEMINI_API_KEY)
            return null;
        try {
            const prompt = `Analyze this GitHub Issue and suggest a potential fix or next step in 2 sentences.
      Title: ${title}
      Description: ${body}`;
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            console.error('Error analyzing issue with AI:', error);
            return null;
        }
    }
}
//# sourceMappingURL=ai-service.js.map