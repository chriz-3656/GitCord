export declare class AIService {
    private static providerFactory;
    static initialize(): void;
    private static ensureInitialized;
    private static generateWithCache;
    static summarizePR(title: string, body: string): Promise<string | null>;
    static analyzeIssue(title: string, body: string): Promise<string | null>;
    static commitSummarization(commitMessage: string, commitDiff: string): Promise<string | null>;
    static changelogGeneration(commits: Array<{
        message: string;
        author: string;
        date: string;
    }>, version: string): Promise<string | null>;
    static projectHealthAnalysis(repoStats: {
        stars: number;
        forks: number;
        openIssues: number;
        openPRs: number;
        lastCommit: string;
        contributors: number;
    }): Promise<string | null>;
    static readmeAnalysis(readmeContent: string): Promise<string | null>;
    static contributorInsights(contributors: Array<{
        username: string;
        commits: number;
        prs: number;
        issues: number;
    }>): Promise<string | null>;
    static riskAnalysis(changeDetails: {
        filesChanged: number;
        linesAdded: number;
        linesRemoved: number;
        changedFiles: string[];
        description: string;
    }): Promise<string | null>;
}
