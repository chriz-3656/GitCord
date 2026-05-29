interface LeaderboardEntry {
    position: number;
    name: string;
    value: number;
    metadata?: Record<string, any>;
}
interface ContributorLeaderboardEntry extends LeaderboardEntry {
    avatarUrl?: string | null;
    discordId?: string | null;
}
interface RepositoryLeaderboardEntry extends LeaderboardEntry {
    fullName: string;
    description?: string | null;
    bannerUrl?: string | null;
}
export declare class LeaderboardService {
    private static readonly CACHE_TTL;
    private static cache;
    /**
     * Calculate weighted reputation score for a contributor
     * Higher weights for quality contributions
     */
    private static calculateContributorScore;
    /**
     * Calculate repository engagement score
     */
    private static calculateRepositoryScore;
    /**
     * Get most starred projects
     */
    static getMostStarredProjects(limit?: number): Promise<RepositoryLeaderboardEntry[]>;
    /**
     * Get top contributors by reputation
     */
    static getTopContributors(limit?: number): Promise<ContributorLeaderboardEntry[]>;
    /**
     * Get trending repositories (by recent activity)
     */
    static getTrendingRepositories(limit?: number, daysBack?: number): Promise<RepositoryLeaderboardEntry[]>;
    /**
     * Get most active projects (by total event count)
     */
    static getMostActiveProjects(limit?: number): Promise<RepositoryLeaderboardEntry[]>;
    /**
     * Get repo of the week (highest engagement in last 7 days)
     */
    static getRepoOfTheWeek(): Promise<RepositoryLeaderboardEntry | null>;
    /**
     * Get most helpful contributors (by reviews and issue resolutions)
     */
    static getMostHelpfulContributors(limit?: number): Promise<ContributorLeaderboardEntry[]>;
    /**
     * Get hall of fame (all-time top performers)
     */
    static getHallOfFame(limit?: number): Promise<ContributorLeaderboardEntry[]>;
    /**
     * Get category rankings
     */
    static getCategoryRanking(category: string, limit?: number): Promise<RepositoryLeaderboardEntry[]>;
    /**
     * Clear cache (for testing or manual refresh)
     */
    static clearCache(pattern?: string): void;
    private static isValidCache;
    private static getFromCache;
    private static setCache;
}
export {};
