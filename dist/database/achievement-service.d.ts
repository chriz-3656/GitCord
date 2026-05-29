export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    requirement: string;
}
export declare class AchievementService {
    /**
     * Get all badge definitions
     */
    static getAllBadges(): BadgeDefinition[];
    /**
     * Get a specific badge definition
     */
    static getBadgeDefinition(badgeId: string): BadgeDefinition | null;
    /**
     * Award a badge to a contributor
     */
    static awardBadge(contributorId: string, badgeId: string): Promise<boolean>;
    /**
     * Check and award badges based on contributor stats
     */
    static checkAndAwardBadges(contributor: any): Promise<string[]>;
    /**
     * Get contributor's badges
     */
    static getContributorBadges(contributorId: string): Promise<{
        id: string;
        name: string;
        description: string;
        icon: string;
        rarity: string;
        awardedAt: Date;
    }[]>;
    /**
     * Check if contributor has a badge
     */
    static hasBadge(contributorId: string, badgeId: string): Promise<boolean>;
    /**
     * Get badge rarity color
     */
    static getRarityColor(rarity: string): number;
    /**
     * Get badge rarity emoji
     */
    static getRarityEmoji(rarity: string): string;
    /**
     * Calculate activity streak
     */
    static calculateActivityStreak(contributorId: string): Promise<{
        current: number;
        max: number;
    }>;
    /**
     * Get contribution history (last 30 days)
     */
    static getContributionHistory(contributorId: string): Promise<{
        interactions: {
            type: string;
            repository: string;
            date: Date;
        }[];
        follows: {
            repository: string;
            date: Date;
        }[];
    }>;
    /**
     * Get top languages used by contributor (from repositories)
     */
    static getTopLanguages(contributorId: string): Promise<string[]>;
}
