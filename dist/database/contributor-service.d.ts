export declare class ContributorService {
    static getOrCreateByDiscordId(discordId: string, username: string, avatarUrl?: string): Promise<{
        issues: number;
        commits: number;
        id: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        discordId: string | null;
        avatarUrl: string | null;
        reputation: number;
        prs: number;
        stars: number;
        mergedPrs: number;
        helpfulReviews: number;
    }>;
    static updateStats(data: {
        username: string;
        avatarUrl?: string;
        type: 'commit' | 'pr' | 'issue' | 'star';
    }): Promise<{
        issues: number;
        commits: number;
        id: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        discordId: string | null;
        avatarUrl: string | null;
        reputation: number;
        prs: number;
        stars: number;
        mergedPrs: number;
        helpfulReviews: number;
    }>;
    static getProfile(username: string): Promise<({
        achievements: ({
            achievement: {
                name: string;
                id: string;
                description: string;
                icon: string;
                rarity: string;
            };
        } & {
            id: string;
            contributorId: string;
            achievementId: string;
            awardedAt: Date;
        })[];
    } & {
        issues: number;
        commits: number;
        id: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        discordId: string | null;
        avatarUrl: string | null;
        reputation: number;
        prs: number;
        stars: number;
        mergedPrs: number;
        helpfulReviews: number;
    }) | null>;
    static getProfileByDiscordId(discordId: string): Promise<({
        achievements: ({
            achievement: {
                name: string;
                id: string;
                description: string;
                icon: string;
                rarity: string;
            };
        } & {
            id: string;
            contributorId: string;
            achievementId: string;
            awardedAt: Date;
        })[];
    } & {
        issues: number;
        commits: number;
        id: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        discordId: string | null;
        avatarUrl: string | null;
        reputation: number;
        prs: number;
        stars: number;
        mergedPrs: number;
        helpfulReviews: number;
    }) | null>;
    static getLeaderboard(): Promise<{
        issues: number;
        commits: number;
        id: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        discordId: string | null;
        avatarUrl: string | null;
        reputation: number;
        prs: number;
        stars: number;
        mergedPrs: number;
        helpfulReviews: number;
    }[]>;
}
