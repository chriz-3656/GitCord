interface GitHubIssue {
    number: number;
    title: string;
    url: string;
    body: string;
    labels: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    requiredSkills: string[];
}
export declare class IssueService {
    private static octokit;
    /**
     * Fetch good-first-issues from a repository
     */
    static getGoodFirstIssues(owner: string, repo: string, limit?: number): Promise<GitHubIssue[]>;
    /**
     * Fetch beginner-friendly issues across multiple repos
     */
    static getBeginnerFriendlyIssues(repos: Array<{
        owner: string;
        name: string;
    }>, limit?: number): Promise<GitHubIssue[]>;
    /**
     * Detect issue difficulty
     */
    private static detectDifficulty;
    /**
     * Extract required skills from issue
     */
    private static extractSkills;
    /**
     * Parse GitHub issue to standard format
     */
    private static parseIssue;
    /**
     * Search issues by language
     */
    static searchIssuesByLanguage(language: string, limit?: number): Promise<GitHubIssue[]>;
    /**
     * Get trending open issues (recently updated)
     */
    static getTrendingIssues(limit?: number): Promise<GitHubIssue[]>;
    /**
     * Get issue details with full analysis
     */
    static getIssueDetails(owner: string, repo: string, issueNumber: number): Promise<any>;
}
export {};
