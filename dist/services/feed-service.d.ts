export interface FeedConfig {
    guildId: string;
    channelId: string;
    feedType: 'trending' | 'security-alerts' | 'weekly-recaps' | 'new-repos' | 'good-first-issues' | 'releases';
    enabled: boolean;
    customChannelName?: string;
}
export interface TrendingFeed {
    repositoryId: string;
    repositoryName: string;
    fullName: string;
    eventCount: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
}
export declare class FeedService {
    /**
     * Get or create feed configuration for a guild
     */
    static getOrCreateFeedConfig(guildId: string, feedType: FeedConfig['feedType']): Promise<FeedConfig | null>;
    /**
     * Get trending repositories for feed
     */
    static getTrendingForFeed(limit?: number, daysBack?: number): Promise<TrendingFeed[]>;
    /**
     * Get newly registered repositories
     */
    static getNewRepositoriesForFeed(limit?: number): Promise<any[]>;
    /**
     * Get "good first issues" from registered repos
     */
    static getGoodFirstIssuesForFeed(limit?: number): Promise<any[]>;
    /**
     * Generate weekly recap data
     */
    static generateWeeklyRecap(guildId: string): Promise<{
        period: string;
        totalRepos: number;
        newRepos: number;
        totalEvents: number;
        topRepo: any;
        topContributor: any;
        highlights: string[];
    }>;
    /**
     * Schedule feed updates (would be called by a cron job in production)
     */
    static updateAllFeeds(guildId: string): Promise<{
        trending: TrendingFeed[];
        newRepos: any[];
        goodFirstIssues: any[];
        weeklyRecap: {
            period: string;
            totalRepos: number;
            newRepos: number;
            totalEvents: number;
            topRepo: any;
            topContributor: any;
            highlights: string[];
        };
    }>;
    /**
     * Get feed channel for a specific feed type
     * (Would query database in production)
     */
    static getFeedChannel(guildId: string, feedType: FeedConfig['feedType']): Promise<string | null>;
    /**
     * Check if a guild has feeds enabled
     */
    static hasFeedsEnabled(guildId: string): Promise<boolean>;
    /**
     * Get all active feed channels for a guild
     */
    static getDefaultFeedChannels(): FeedConfig['feedType'][];
}
