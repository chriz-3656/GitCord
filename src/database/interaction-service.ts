import { prisma } from './prisma.js';
import { NotificationCooldownService } from './notification-cooldown-service.js';

interface InteractionStats {
  likes: number;
  followers: number;
  interested: number;
  comments: number;
  totalEngagement: number;
}

interface UserInteractions {
  likes: string[]; // repository IDs
  followers: string[];
  interested: string[];
}

export class InteractionService {
  /**
   * Add or remove a like
   */
  static async toggleLike(
    repositoryId: string,
    contributorId: string,
  ): Promise<{ action: 'added' | 'removed'; shouldNotify: boolean }> {
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

    const shouldNotify = await NotificationCooldownService.shouldPing(
      contributorId,
      repositoryId,
      'interaction',
      30 * 60 * 1000, // 30 min cooldown for likes
    );

    if (shouldNotify) {
      await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
    }

    return { action: 'added', shouldNotify };
  }

  /**
   * Add or remove a bookmark
   */
  static async toggleBookmark(
    repositoryId: string,
    contributorId: string,
  ): Promise<{ action: 'added' | 'removed'; shouldNotify: boolean }> {
    const existing = await prisma.projectInteraction.findUnique({
      where: {
        type_repositoryId_contributorId: {
          type: 'BOOKMARK',
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
        type: 'BOOKMARK',
        repositoryId,
        contributorId,
      },
    });

    const shouldNotify = await NotificationCooldownService.shouldPing(
      contributorId,
      repositoryId,
      'interaction',
      60 * 60 * 1000, // 1 hour cooldown for bookmarks
    );

    if (shouldNotify) {
      await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
    }

    return { action: 'added', shouldNotify };
  }

  /**
   * Add or remove "interested" marker
   */
  static async toggleInterested(
    repositoryId: string,
    contributorId: string,
  ): Promise<{ action: 'added' | 'removed'; shouldNotify: boolean }> {
    const existing = await prisma.projectInteraction.findUnique({
      where: {
        type_repositoryId_contributorId: {
          type: 'INTERESTED',
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
        type: 'INTERESTED',
        repositoryId,
        contributorId,
      },
    });

    const shouldNotify = await NotificationCooldownService.shouldPing(
      contributorId,
      repositoryId,
      'interaction',
      2 * 60 * 60 * 1000, // 2 hour cooldown for interested markers
    );

    if (shouldNotify) {
      await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
    }

    return { action: 'added', shouldNotify };
  }

  /**
   * Add or remove follow
   */
  static async toggleFollow(
    repositoryId: string,
    contributorId: string,
  ): Promise<{ action: 'added' | 'removed'; shouldNotify: boolean }> {
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

    const shouldNotify = await NotificationCooldownService.shouldPing(
      contributorId,
      repositoryId,
      'interaction',
      60 * 60 * 1000, // 1 hour cooldown for follows
    );

    if (shouldNotify) {
      await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
    }

    return { action: 'added', shouldNotify };
  }

  /**
   * Add a comment
   */
  static async addComment(
    repositoryId: string,
    contributorId: string,
    content: string,
  ): Promise<{ comment: any; shouldNotify: boolean }> {
    const comment = await prisma.showcaseComment.create({
      data: {
        repositoryId,
        contributorId,
        content,
      },
    });

    const shouldNotify = await NotificationCooldownService.shouldPing(
      contributorId,
      repositoryId,
      'interaction',
      15 * 60 * 1000, // 15 min cooldown for comments
    );

    if (shouldNotify) {
      await NotificationCooldownService.recordPing(contributorId, repositoryId, 'interaction');
    }

    return { comment, shouldNotify };
  }

  /**
   * Get engagement stats for a repository
   */
  static async getRepositoryStats(repositoryId: string): Promise<InteractionStats> {
    const likes = await prisma.projectInteraction.count({
      where: { repositoryId, type: 'LIKE' },
    });

    const bookmarks = await prisma.projectInteraction.count({
      where: { repositoryId, type: 'BOOKMARK' },
    });

    const interested = await prisma.projectInteraction.count({
      where: { repositoryId, type: 'INTERESTED' },
    });

    const followers = await prisma.projectFollower.count({
      where: { repositoryId },
    });

    const comments = await prisma.showcaseComment.count({
      where: { repositoryId },
    });

    const totalEngagement = likes + bookmarks + interested + followers + comments;

    return {
      likes,
      followers,
      interested,
      comments,
      totalEngagement,
    };
  }

  /**
   * Get user's interactions
   */
  static async getUserInteractions(contributorId: string): Promise<UserInteractions> {
    const interactions = await prisma.projectInteraction.findMany({
      where: { contributorId },
    });

    const follows = await prisma.projectFollower.findMany({
      where: { contributorId },
    });

    const likes = interactions.filter((i) => i.type === 'LIKE').map((i) => i.repositoryId);
    const followers = follows.map((f) => f.repositoryId);
    const interested = interactions
      .filter((i) => i.type === 'INTERESTED')
      .map((i) => i.repositoryId);

    return {
      likes,
      followers,
      interested,
    };
  }

  /**
   * Check if user has interacted in a specific way
   */
  static async hasInteraction(
    repositoryId: string,
    contributorId: string,
    type: 'LIKE' | 'BOOKMARK' | 'INTERESTED' | 'FOLLOW',
  ): Promise<boolean> {
    if (type === 'FOLLOW') {
      const follow = await prisma.projectFollower.findUnique({
        where: {
          repositoryId_contributorId: {
            repositoryId,
            contributorId,
          },
        },
      });
      return !!follow;
    }

    const interaction = await prisma.projectInteraction.findUnique({
      where: {
        type_repositoryId_contributorId: {
          type,
          repositoryId,
          contributorId,
        },
      },
    });
    return !!interaction;
  }

  /**
   * Get recent interactions for a repository
   */
  static async getRecentInteractions(repositoryId: string, limit = 20) {
    const interactions = await prisma.projectInteraction.findMany({
      where: { repositoryId },
      include: { contributor: { select: { username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const followers = await prisma.projectFollower.findMany({
      where: { repositoryId },
      include: { contributor: { select: { username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit / 2,
    });

    return {
      interactions,
      followers,
    };
  }

  /**
   * Get top interested contributors for a repository
   */
  static async getInterestedContributors(repositoryId: string, limit = 10) {
    const interested = await prisma.projectInteraction.findMany({
      where: { repositoryId, type: 'INTERESTED' },
      include: {
        contributor: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            reputation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return interested.map((i) => i.contributor);
  }
}
