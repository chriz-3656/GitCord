import { prisma } from './prisma.js';
export class ContributorService {
    static async updateStats(data) {
        const update = {};
        if (data.type === 'commit')
            update.commits = { increment: 1 };
        if (data.type === 'pr')
            update.prs = { increment: 1 };
        if (data.type === 'issue')
            update.issues = { increment: 1 };
        if (data.type === 'star')
            update.stars = { increment: 1 };
        return prisma.contributor.upsert({
            where: { username: data.username },
            update: {
                ...update,
                avatarUrl: data.avatarUrl,
            },
            create: {
                username: data.username,
                avatarUrl: data.avatarUrl,
                commits: data.type === 'commit' ? 1 : 0,
                prs: data.type === 'pr' ? 1 : 0,
                issues: data.type === 'issue' ? 1 : 0,
                stars: data.type === 'star' ? 1 : 0,
            },
        });
    }
    static async getLeaderboard() {
        return prisma.contributor.findMany({
            orderBy: [
                { commits: 'desc' },
                { prs: 'desc' },
            ],
            take: 10,
        });
    }
}
//# sourceMappingURL=contributor-service.js.map