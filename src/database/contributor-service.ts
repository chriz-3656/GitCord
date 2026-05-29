import { prisma } from './prisma.js';

export class ContributorService {
  static async getOrCreateByDiscordId(discordId: string, username: string, avatarUrl?: string) {
    return prisma.contributor.upsert({
      where: { discordId },
      update: { username, avatarUrl },
      create: { discordId, username, avatarUrl },
    });
  }

  static async updateStats(data: {
    username: string;
    avatarUrl?: string;
    type: 'commit' | 'pr' | 'issue' | 'star';
  }) {
    const update: any = {};
    let reputationGain = 0;

    if (data.type === 'commit') {
      update.commits = { increment: 1 };
      reputationGain = 1;
    }
    if (data.type === 'pr') {
      update.prs = { increment: 1 };
      reputationGain = 5;
    }
    if (data.type === 'issue') {
      update.issues = { increment: 1 };
      reputationGain = 2;
    }
    if (data.type === 'star') {
      update.stars = { increment: 1 };
    }

    return prisma.contributor.upsert({
      where: { username: data.username },
      update: {
        ...update,
        avatarUrl: data.avatarUrl,
        reputation: { increment: reputationGain },
      },
      create: {
        username: data.username,
        avatarUrl: data.avatarUrl,
        commits: data.type === 'commit' ? 1 : 0,
        prs: data.type === 'pr' ? 1 : 0,
        issues: data.type === 'issue' ? 1 : 0,
        stars: data.type === 'star' ? 1 : 0,
        reputation: reputationGain,
      },
    });
  }

  static async getProfile(username: string) {
    return prisma.contributor.findUnique({
      where: { username },
      include: {
        achievements: {
          include: { achievement: true },
        },
      },
    });
  }

  static async getProfileByDiscordId(discordId: string) {
    return prisma.contributor.findUnique({
      where: { discordId },
      include: {
        achievements: {
          include: { achievement: true },
        },
      },
    });
  }

  static async getLeaderboard() {
    return prisma.contributor.findMany({
      orderBy: [{ commits: 'desc' }, { prs: 'desc' }],
      take: 10,
    });
  }
}
