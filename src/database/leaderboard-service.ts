import { prisma } from './prisma.js';

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

export class LeaderboardService {
  private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Calculate weighted reputation score for a contributor
   * Higher weights for quality contributions
   */
  private static calculateContributorScore(stats: any): number {
    return (
      stats.commits * 1 + // 1 point per commit
      stats.mergedPrs * 5 + // 5 points per merged PR
      stats.issues * 3 + // 3 points per issue resolved
      stats.helpfulReviews * 2 + // 2 points per helpful review
      stats.stars * 1 // 1 point per repo starred
    );
  }

  /**
   * Calculate repository engagement score
   */
  private static calculateRepositoryScore(repo: any, interactions: any): number {
    return interactions.likes * 2 + interactions.followers * 3 + interactions.comments * 1;
  }

  /**
   * Get most starred projects
   */
  static async getMostStarredProjects(limit = 10): Promise<RepositoryLeaderboardEntry[]> {
    const cacheKey = `starred-${limit}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const analytics = await prisma.projectAnalytics.groupBy({
      by: ['repositoryId'],
      _sum: { starCount: true },
      orderBy: { _sum: { starCount: 'desc' } },
      take: limit,
    });

    const result: RepositoryLeaderboardEntry[] = [];
    for (let i = 0; i < analytics.length; i++) {
      const repo = await prisma.repository.findUnique({
        where: { id: analytics[i].repositoryId },
      });
      if (repo) {
        result.push({
          position: i + 1,
          name: repo.name,
          fullName: repo.fullName,
          value: analytics[i]._sum.starCount || 0,
          description: repo.description,
          bannerUrl: repo.bannerUrl,
        });
      }
    }

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get top contributors by reputation
   */
  static async getTopContributors(limit = 10): Promise<ContributorLeaderboardEntry[]> {
    const cacheKey = `contributors-${limit}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const contributors = await prisma.contributor.findMany({
      orderBy: { reputation: 'desc' },
      take: limit,
    });

    const result = contributors.map((c, i) => ({
      position: i + 1,
      name: c.username,
      value: c.reputation,
      avatarUrl: c.avatarUrl,
      discordId: c.discordId,
      metadata: {
        commits: c.commits,
        prs: c.prs,
        issues: c.issues,
        mergedPrs: c.mergedPrs,
      },
    }));

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get trending repositories (by recent activity)
   */
  static async getTrendingRepositories(
    limit = 10,
    daysBack = 7,
  ): Promise<RepositoryLeaderboardEntry[]> {
    const cacheKey = `trending-${limit}-${daysBack}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const analytics = await prisma.projectAnalytics.groupBy({
      by: ['repositoryId'],
      _sum: { eventCount: true },
      where: { date: { gte: cutoffDate } },
      orderBy: { _sum: { eventCount: 'desc' } },
      take: limit,
    });

    const result: RepositoryLeaderboardEntry[] = [];
    for (let i = 0; i < analytics.length; i++) {
      const repo = await prisma.repository.findUnique({
        where: { id: analytics[i].repositoryId },
      });
      if (repo) {
        result.push({
          position: i + 1,
          name: repo.name,
          fullName: repo.fullName,
          value: analytics[i]._sum.eventCount || 0,
          metadata: { daysBack },
        });
      }
    }

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get most active projects (by total event count)
   */
  static async getMostActiveProjects(limit = 10): Promise<RepositoryLeaderboardEntry[]> {
    const cacheKey = `active-${limit}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const analytics = await prisma.projectAnalytics.groupBy({
      by: ['repositoryId'],
      _sum: { eventCount: true },
      orderBy: { _sum: { eventCount: 'desc' } },
      take: limit,
    });

    const result: RepositoryLeaderboardEntry[] = [];
    for (let i = 0; i < analytics.length; i++) {
      const repo = await prisma.repository.findUnique({
        where: { id: analytics[i].repositoryId },
      });
      if (repo) {
        result.push({
          position: i + 1,
          name: repo.name,
          fullName: repo.fullName,
          value: analytics[i]._sum.eventCount || 0,
        });
      }
    }

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get repo of the week (highest engagement in last 7 days)
   */
  static async getRepoOfTheWeek(): Promise<RepositoryLeaderboardEntry | null> {
    const cacheKey = 'repo-of-week';
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const repos = await prisma.repository.findMany({
      include: {
        interactions: {
          where: { createdAt: { gte: weekAgo } },
        },
        followers: {
          where: { createdAt: { gte: weekAgo } },
        },
        comments: {
          where: { createdAt: { gte: weekAgo } },
        },
        analytics: {
          where: { date: { gte: weekAgo } },
        },
      },
    });

    let topRepo = null;
    let topScore = -1;

    for (const repo of repos) {
      const eventCount = repo.analytics.length > 0 ? repo.analytics[0].eventCount : 0;
      const score =
        repo.interactions.length * 2 +
        repo.followers.length * 3 +
        repo.comments.length * 1 +
        eventCount * 0.1;

      if (score > topScore) {
        topScore = score;
        topRepo = repo;
      }
    }

    if (topRepo) {
      const result = {
        position: 1,
        name: topRepo.name,
        fullName: topRepo.fullName,
        value: topScore,
        description: topRepo.description,
        bannerUrl: topRepo.bannerUrl,
      };
      this.setCache(cacheKey, result);
      return result;
    }

    return null;
  }

  /**
   * Get most helpful contributors (by reviews and issue resolutions)
   */
  static async getMostHelpfulContributors(limit = 10): Promise<ContributorLeaderboardEntry[]> {
    const cacheKey = `helpful-${limit}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const contributors = await prisma.contributor.findMany({
      orderBy: [{ helpfulReviews: 'desc' }, { issues: 'desc' }],
      take: limit,
    });

    const result = contributors.map((c, i) => ({
      position: i + 1,
      name: c.username,
      value: c.helpfulReviews + c.issues,
      avatarUrl: c.avatarUrl,
      discordId: c.discordId,
      metadata: {
        helpfulReviews: c.helpfulReviews,
        issuesResolved: c.issues,
      },
    }));

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get hall of fame (all-time top performers)
   */
  static async getHallOfFame(limit = 10): Promise<ContributorLeaderboardEntry[]> {
    const cacheKey = `hall-of-fame-${limit}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const contributors = await prisma.contributor.findMany({
      where: { reputation: { gt: 0 } },
      orderBy: { reputation: 'desc' },
      take: limit,
    });

    const result = contributors.map((c, i) => ({
      position: i + 1,
      name: c.username,
      value: c.reputation,
      avatarUrl: c.avatarUrl,
      discordId: c.discordId,
      metadata: {
        commits: c.commits,
        prs: c.prs,
        issues: c.issues,
        mergedPrs: c.mergedPrs,
        score: this.calculateContributorScore(c),
      },
    }));

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get category rankings
   */
  static async getCategoryRanking(
    category: string,
    limit = 10,
  ): Promise<RepositoryLeaderboardEntry[]> {
    const cacheKey = `category-${category}-${limit}`;
    if (this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    const repos = await prisma.repository.findMany({
      where: { category: category.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const result: RepositoryLeaderboardEntry[] = [];
    for (let i = 0; i < repos.length; i++) {
      result.push({
        position: i + 1,
        name: repos[i].name,
        fullName: repos[i].fullName,
        value: repos[i].createdAt.getTime(), // Use creation time for now
        description: repos[i].description,
      });
    }

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  static clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  private static isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < this.CACHE_TTL;
  }

  private static getFromCache(key: string): any {
    return this.cache.get(key)?.data;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}
