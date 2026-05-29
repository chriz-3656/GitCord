import { prisma } from './prisma.js';
import { NotificationCooldownService } from './notification-cooldown-service.js';
export class EngagementService {
    /**
     * Toggle like with notification check
     */
    static async toggleLike(repositoryId, contributorId) {
        const existing = await prisma.projectInteraction.findUnique({
            where: {
                type_repositoryId_contributorId: {
                    type: 'LIKE',
                    repositoryId,
                    contributorId,
                },
            },
        });
        if (existing) {
            await prisma.projectInteraction.delete({ where: { id: existing.id } });
            return { action: 'removed', shouldNotify: false };
        }
        await prisma.projectInteraction.create({
            data: {
                type: 'LIKE',
                repositoryId,
                contributorId,
            },
        });
        const shouldNotify = await NotificationCooldownService.shouldPing(contributorId, repositoryId, 'interaction');
        if (shouldNotify) {
            await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
        }
        return { action: 'added', shouldNotify };
    }
    /**
     * Toggle follow with notification check
     */
    static async toggleFollow(repositoryId, contributorId) {
        const existing = await prisma.projectFollower.findUnique({
            where: {
                repositoryId_contributorId: {
                    repositoryId,
                    contributorId,
                },
            },
        });
        if (existing) {
            await prisma.projectFollower.delete({ where: { id: existing.id } });
            return { action: 'removed', shouldNotify: false };
        }
        await prisma.projectFollower.create({
            data: {
                repositoryId,
                contributorId,
            },
        });
        const shouldNotify = await NotificationCooldownService.shouldPing(contributorId, repositoryId, 'interaction');
        if (shouldNotify) {
            await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
        }
        return { action: 'added', shouldNotify };
    }
    /**
     * Add comment with notification check
     */
    static async addComment(repositoryId, contributorId, content) {
        const comment = await prisma.showcaseComment.create({
            data: {
                repositoryId,
                contributorId,
                content,
            },
        });
        const shouldNotify = await NotificationCooldownService.shouldPing(contributorId, repositoryId, 'interaction');
        if (shouldNotify) {
            await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
        }
        return { comment, shouldNotify };
    }
    /**
     * Get interaction stats for a repository
     */
    static async getInteractionStats(repositoryId) {
        const likes = await prisma.projectInteraction.count({
            where: { repositoryId, type: 'LIKE' },
        });
        const followers = await prisma.projectFollower.count({
            where: { repositoryId },
        });
        const comments = await prisma.showcaseComment.count({
            where: { repositoryId },
        });
        return { likes, followers, comments };
    }
    /**
     * Get analytics for a repository
     */
    static async getAnalytics(repositoryId) {
        return prisma.projectAnalytics.findMany({
            where: { repositoryId },
            orderBy: { date: 'desc' },
            take: 7,
        });
    }
}
//# sourceMappingURL=engagement-service.js.map