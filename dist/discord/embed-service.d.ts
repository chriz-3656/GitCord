import { EmbedBuilder } from 'discord.js';
import { PushEvent, PullRequestEvent, IssuesEvent, StarEvent } from '../webhooks/schemas.js';
export declare class EmbedService {
    private static readonly COLORS;
    static createPushEmbed(event: PushEvent): EmbedBuilder;
    static createPREmbed(event: PullRequestEvent, aiSummary?: string | null): EmbedBuilder;
    static createIssueEmbed(event: IssuesEvent, aiAnalysis?: string | null): EmbedBuilder;
    static createStarEmbed(event: StarEvent): EmbedBuilder;
    /**
     * Create a showcase/project card embed
     */
    static createShowcaseEmbed(repository: any, stats?: {
        stars?: number;
        forks?: number;
        contributors?: number;
        languages?: string[];
    }): Promise<EmbedBuilder>;
}
