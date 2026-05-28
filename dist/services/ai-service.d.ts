export declare class AIService {
    private static genAI;
    private static model;
    static summarizePR(title: string, body: string): Promise<string | null>;
    static analyzeIssue(title: string, body: string): Promise<string | null>;
}
