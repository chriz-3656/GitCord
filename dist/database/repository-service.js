import { prisma } from './prisma.js';
export class RepositoryService {
    static async registerRepository(data) {
        // Ensure guild exists
        await prisma.guild.upsert({
            where: { id: data.guildId },
            update: { name: data.guildName },
            create: { id: data.guildId, name: data.guildName },
        });
        const name = data.fullName.split('/').pop() || data.fullName;
        return prisma.repository.upsert({
            where: {
                guildId_fullName: {
                    guildId: data.guildId,
                    fullName: data.fullName,
                },
            },
            update: {
                channelId: data.channelId,
                webhookSecret: data.webhookSecret,
            },
            create: {
                guildId: data.guildId,
                fullName: data.fullName,
                name,
                channelId: data.channelId,
                webhookSecret: data.webhookSecret,
            },
        });
    }
    static async updateMetadata(id, data) {
        return prisma.repository.update({
            where: { id },
            data,
        });
    }
    static async getRepositoryWithStats(id) {
        return prisma.repository.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        interactions: true,
                        followers: true,
                        comments: true,
                    },
                },
            },
        });
    }
    static async getRepositoryByFullName(fullName) {
        return prisma.repository.findFirst({
            where: { fullName },
        });
    }
    static async listRepositories(guildId) {
        return prisma.repository.findMany({
            where: { guildId },
        });
    }
    static async removeRepository(guildId, fullName) {
        return prisma.repository.delete({
            where: {
                guildId_fullName: {
                    guildId,
                    fullName,
                },
            },
        });
    }
}
//# sourceMappingURL=repository-service.js.map