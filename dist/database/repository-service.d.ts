export declare class RepositoryService {
    static registerRepository(data: {
        guildId: string;
        guildName: string;
        fullName: string;
        channelId: string;
        webhookSecret: string;
    }): Promise<any>;
    static getRepositoryByFullName(fullName: string): Promise<any>;
    static listRepositories(guildId: string): Promise<any>;
    static removeRepository(guildId: string, fullName: string): Promise<any>;
}
