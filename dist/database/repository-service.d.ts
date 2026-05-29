export declare class RepositoryService {
    static registerRepository(data: {
        guildId: string;
        guildName: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
    }): Promise<{
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guildId: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
        bannerUrl: string | null;
        description: string | null;
        techStack: string | null;
        category: string | null;
    }>;
    static updateMetadata(id: string, data: {
        bannerUrl?: string;
        description?: string;
        techStack?: string;
        status?: string;
        category?: string;
    }): Promise<{
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guildId: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
        bannerUrl: string | null;
        description: string | null;
        techStack: string | null;
        category: string | null;
    }>;
    static getRepositoryWithStats(id: string): Promise<({
        _count: {
            interactions: number;
            followers: number;
            comments: number;
        };
    } & {
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guildId: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
        bannerUrl: string | null;
        description: string | null;
        techStack: string | null;
        category: string | null;
    }) | null>;
    static getRepositoryByFullName(fullName: string): Promise<{
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guildId: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
        bannerUrl: string | null;
        description: string | null;
        techStack: string | null;
        category: string | null;
    } | null>;
    static listRepositories(guildId: string): Promise<{
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guildId: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
        bannerUrl: string | null;
        description: string | null;
        techStack: string | null;
        category: string | null;
    }[]>;
    static removeRepository(guildId: string, fullName: string): Promise<{
        status: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guildId: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
        bannerUrl: string | null;
        description: string | null;
        techStack: string | null;
        category: string | null;
    }>;
}
