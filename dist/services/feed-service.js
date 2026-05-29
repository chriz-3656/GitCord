import { prisma } from '../database/prisma.js';
export class FeedService {
    /**
     * Get or create feed configuration for a guild
     */
    static async getOrCreateFeedConfig(guildId, feedType) {
        // Note: This would need a new Prisma model for FeedConfig in production
        // For now, we'll return a placeholder config
        return {
            guildId,
            channelId: '', // Would be stored in DB
            feedType,
            enabled: true,
        };
    }
    /**
     * Get trending repositories for feed
     */
    static async getTrendingForFeed(limit = 5, daysBack = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        const analytics = await prisma.projectAnalytics.groupBy({
            by: ['repositoryId'],
            _sum: { eventCount: true },
            where: { date: { gte: cutoffDate } },
            orderBy: { _sum: { eventCount: 'desc' } },
            take: limit,
        });
        const results = [];
        for (const analytic of analytics) {
            const repo = await prisma.repository.findUnique({
                where: { id: analytic.repositoryId },
            });
            if (repo) {
                // Simple trend calculation (would be more sophisticated in production)
                const trend = analytic._sum.eventCount > 10 ? 'up' : 'stable';
                results.push({
                    repositoryId: repo.id,
                    repositoryName: repo.name,
                    fullName: repo.fullName,
                    eventCount: analytic._sum.eventCount || 0,
                    trend,
                    lastUpdated: new Date(),
                });
            }
        }
        return results;
    }
    /**
     * Get newly registered repositories
     */
    static async getNewRepositoriesForFeed(limit = 5) {
        return prisma.repository.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    /**
     * Get "good first issues" from registered repos
     */
    static async getGoodFirstIssuesForFeed(limit = 5) {
        // This would fetch from GitHub API in production
        // For now, return a placeholder
        return [];
    }
    /**
     * Generate weekly recap data
     */
    static async generateWeeklyRecap(guildId) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const repos = await prisma.repository.findMany({
            where: { guildId },
        });
        const recap = {
            period: 'Last 7 days',
            totalRepos: repos.length,
            newRepos: 0,
            totalEvents: 0,
            topRepo: null,
            topContributor: null,
            highlights: [],
        };
        // Calculate stats
        const analytics = await prisma.projectAnalytics.findMany({
            where: {
                repositoryId: { in: repos.map((r) => r.id) },
                date: { gte: weekAgo },
            },
        });
        recap.totalEvents = analytics.reduce((sum, a) => sum + a.eventCount, 0);
        // Find top repo
        const topRepoAnalytics = analytics.sort((a, b) => b.eventCount - a.eventCount)[0];
        if (topRepoAnalytics) {
            const topRepo = repos.find((r) => r.id === topRepoAnalytics.repositoryId);
            recap.topRepo = topRepo;
        }
        // Get top contributor
        const contributors = await prisma.contributor.findMany({
            where: { createdAt: { gte: weekAgo } },
            orderBy: { reputation: 'desc' },
            take: 1,
        });
        if (contributors.length > 0) {
            recap.topContributor = contributors[0];
        }
        // Generate highlights
        if (recap.totalEvents > 100) {
            recap.highlights.push(`🔥 ${recap.totalEvents} total events this week!`);
        }
        if (recap.topRepo) {
            recap.highlights.push(`⭐ Top project: ${recap.topRepo.name}`);
        }
        if (recap.topContributor) {
            recap.highlights.push(`🏆 Star contributor: ${recap.topContributor.username}`);
        }
        return recap;
    }
    /**
     * Schedule feed updates (would be called by a cron job in production)
     */
    static async updateAllFeeds(guildId) {
        // This would orchestrate all feed updates
        // In production, this would be triggered by cron jobs
        return {
            trending: await this.getTrendingForFeed(),
            newRepos: await this.getNewRepositoriesForFeed(),
            goodFirstIssues: await this.getGoodFirstIssuesForFeed(),
            weeklyRecap: await this.generateWeeklyRecap(guildId),
        };
    }
    /**
     * Get feed channel for a specific feed type
     * (Would query database in production)
     */
    static async getFeedChannel(guildId, feedType) {
        // Placeholder - would be stored in database
        const feedNames = {
            trending: 'trending-projects',
            'security-alerts': 'security-alerts',
            'weekly-recaps': 'weekly-recaps',
            'new-repos': 'new-repositories',
            'good-first-issues': 'good-first-issues',
            releases: 'releases',
        };
        return feedNames[feedType] || null;
    }
    /**
     * Check if a guild has feeds enabled
     */
    static async hasFeedsEnabled(guildId) {
        const repos = await prisma.repository.findFirst({
            where: { guildId },
        });
        return !!repos; // Feeds enabled if guild has registered repos
    }
    /**
     * Get all active feed channels for a guild
     */
    static getDefaultFeedChannels() {
        return ['trending', 'security-alerts', 'weekly-recaps', 'new-repos', 'good-first-issues'];
    }
}
//# sourceMappingURL=feed-service.js.map