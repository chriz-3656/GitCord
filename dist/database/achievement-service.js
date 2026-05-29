import { prisma } from './prisma.js';
const BADGE_DEFINITIONS = {
    first_pr: {
        id: 'first_pr',
        name: 'First PR',
        description: 'Merged your first pull request',
        icon: '🎯',
        rarity: 'COMMON',
        requirement: 'mergedPrs >= 1',
    },
    hundred_commits: {
        id: 'hundred_commits',
        name: '💯 Century',
        description: 'Reached 100 commits',
        icon: '📍',
        rarity: 'RARE',
        requirement: 'commits >= 100',
    },
    trending_repo: {
        id: 'trending_repo',
        name: 'Trending Developer',
        description: 'Created a trending repository',
        icon: '🔥',
        rarity: 'RARE',
        requirement: 'repo_trending',
    },
    security_researcher: {
        id: 'security_researcher',
        name: 'Security Guardian',
        description: 'Found and reported security issues',
        icon: '🔐',
        rarity: 'EPIC',
        requirement: 'issues >= 5',
    },
    community_helper: {
        id: 'community_helper',
        name: 'Community Helper',
        description: 'Provided helpful reviews and solutions',
        icon: '🤝',
        rarity: 'RARE',
        requirement: 'helpfulReviews >= 10',
    },
    hackathon_winner: {
        id: 'hackathon_winner',
        name: 'Hackathon Champion',
        description: 'Won a hackathon challenge',
        icon: '🏆',
        rarity: 'LEGENDARY',
        requirement: 'hackathon_won',
    },
    issue_master: {
        id: 'issue_master',
        name: 'Issue Master',
        description: 'Resolved 50 issues',
        icon: '⚔️',
        rarity: 'EPIC',
        requirement: 'issues >= 50',
    },
    thousand_stars: {
        id: 'thousand_stars',
        name: '⭐ Stargazer',
        description: 'Projects received 1000+ stars combined',
        icon: '✨',
        rarity: 'LEGENDARY',
        requirement: 'total_stars >= 1000',
    },
};
export class AchievementService {
    /**
     * Get all badge definitions
     */
    static getAllBadges() {
        return Object.values(BADGE_DEFINITIONS);
    }
    /**
     * Get a specific badge definition
     */
    static getBadgeDefinition(badgeId) {
        return BADGE_DEFINITIONS[badgeId] || null;
    }
    /**
     * Award a badge to a contributor
     */
    static async awardBadge(contributorId, badgeId) {
        const badge = BADGE_DEFINITIONS[badgeId];
        if (!badge)
            return false;
        try {
            // Create or get achievement
            let achievement = await prisma.achievement.findUnique({
                where: { name: badge.name },
            });
            if (!achievement) {
                achievement = await prisma.achievement.create({
                    data: {
                        name: badge.name,
                        description: badge.description,
                        icon: badge.icon,
                        rarity: badge.rarity,
                    },
                });
            }
            // Check if already awarded
            const existing = await prisma.contributorAchievement.findUnique({
                where: {
                    contributorId_achievementId: {
                        contributorId,
                        achievementId: achievement.id,
                    },
                },
            });
            if (existing) {
                return false; // Already awarded
            }
            // Award badge
            await prisma.contributorAchievement.create({
                data: {
                    contributorId,
                    achievementId: achievement.id,
                },
            });
            return true;
        }
        catch (error) {
            console.error('Error awarding badge:', error);
            return false;
        }
    }
    /**
     * Check and award badges based on contributor stats
     */
    static async checkAndAwardBadges(contributor) {
        const awarded = [];
        // First PR
        if (contributor.mergedPrs >= 1 && !(await this.hasBadge(contributor.id, 'first_pr'))) {
            if (await this.awardBadge(contributor.id, 'first_pr')) {
                awarded.push('First PR');
            }
        }
        // 100 Commits
        if (contributor.commits >= 100 && !(await this.hasBadge(contributor.id, 'hundred_commits'))) {
            if (await this.awardBadge(contributor.id, 'hundred_commits')) {
                awarded.push('💯 Century');
            }
        }
        // Community Helper
        if (contributor.helpfulReviews >= 10 &&
            !(await this.hasBadge(contributor.id, 'community_helper'))) {
            if (await this.awardBadge(contributor.id, 'community_helper')) {
                awarded.push('Community Helper');
            }
        }
        // Issue Master
        if (contributor.issues >= 50 && !(await this.hasBadge(contributor.id, 'issue_master'))) {
            if (await this.awardBadge(contributor.id, 'issue_master')) {
                awarded.push('Issue Master');
            }
        }
        // Security Researcher
        if (contributor.issues >= 5 && !(await this.hasBadge(contributor.id, 'security_researcher'))) {
            if (await this.awardBadge(contributor.id, 'security_researcher')) {
                awarded.push('Security Guardian');
            }
        }
        return awarded;
    }
    /**
     * Get contributor's badges
     */
    static async getContributorBadges(contributorId) {
        const achievements = await prisma.contributorAchievement.findMany({
            where: { contributorId },
            include: { achievement: true },
            orderBy: { awardedAt: 'desc' },
        });
        return achievements.map((ca) => ({
            id: ca.achievement.id,
            name: ca.achievement.name,
            description: ca.achievement.description,
            icon: ca.achievement.icon,
            rarity: ca.achievement.rarity,
            awardedAt: ca.awardedAt,
        }));
    }
    /**
     * Check if contributor has a badge
     */
    static async hasBadge(contributorId, badgeId) {
        const badge = BADGE_DEFINITIONS[badgeId];
        if (!badge)
            return false;
        const existing = await prisma.achievement.findFirst({
            where: {
                name: badge.name,
                contributors: {
                    some: {
                        contributorId,
                    },
                },
            },
        });
        return !!existing;
    }
    /**
     * Get badge rarity color
     */
    static getRarityColor(rarity) {
        const colors = {
            COMMON: 0x808080, // Gray
            RARE: 0x4169e1, // Blue
            EPIC: 0x9932cc, // Purple
            LEGENDARY: 0xffd700, // Gold
        };
        return colors[rarity] || 0x808080;
    }
    /**
     * Get badge rarity emoji
     */
    static getRarityEmoji(rarity) {
        const emojis = {
            COMMON: '⚪',
            RARE: '🔵',
            EPIC: '🟣',
            LEGENDARY: '⭐',
        };
        return emojis[rarity] || '⚪';
    }
    /**
     * Calculate activity streak
     */
    static async calculateActivityStreak(contributorId) {
        // This would require detailed activity tracking in production
        // For now, return placeholder
        return {
            current: 0,
            max: 0,
        };
    }
    /**
     * Get contribution history (last 30 days)
     */
    static async getContributionHistory(contributorId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const interactions = await prisma.projectInteraction.findMany({
            where: {
                contributorId,
                createdAt: { gte: thirtyDaysAgo },
            },
            include: { repository: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const followers = await prisma.projectFollower.findMany({
            where: {
                contributorId,
                createdAt: { gte: thirtyDaysAgo },
            },
            include: { repository: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return {
            interactions: interactions.map((i) => ({
                type: i.type,
                repository: i.repository.name,
                date: i.createdAt,
            })),
            follows: followers.map((f) => ({
                repository: f.repository.name,
                date: f.createdAt,
            })),
        };
    }
    /**
     * Get top languages used by contributor (from repositories)
     */
    static async getTopLanguages(contributorId) {
        // This would require detailed language tracking
        // For now, return placeholder
        return [];
    }
}
//# sourceMappingURL=achievement-service.js.map