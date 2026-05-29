import { ActionRowBuilder, ButtonBuilder, ContainerBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, SectionBuilder, TextDisplayBuilder } from 'discord.js';
import { SecurityIssue } from '../../security/security-service.js';
type V2Component = ContainerBuilder | TextDisplayBuilder | SeparatorBuilder | SectionBuilder | ActionRowBuilder<ButtonBuilder> | MediaGalleryBuilder;
export interface ComponentsV2Reply {
    flags: typeof MessageFlags.IsComponentsV2;
    components: V2Component[];
}
export interface ShowcaseCardInput {
    repoId: string;
    fullName: string;
    name: string;
    description?: string | null;
    bannerUrl?: string | null;
    techStack?: string | null;
    status?: string | null;
    category?: string | null;
    likes?: number;
    followers?: number;
    comments?: number;
}
export interface LeaderboardCardInput {
    title: string;
    subtitle: string;
    accentColor?: number;
    items: string[];
}
export interface ProfileCardInput {
    username: string;
    avatarUrl: string;
    reputation: number;
    tier: string;
    commits: number;
    prs: number;
    mergedPrs: number;
    issues: number;
    stars: number;
    helpfulReviews: number;
    badges: string[];
}
export interface IssueCardInput {
    title: string;
    subtitle: string;
    items: string[];
}
export interface ReleaseCardInput {
    title: string;
    version: string;
    tagName: string;
    type: string;
    author: string;
    authorAvatar?: string | null;
    authorUrl?: string | null;
    releasedAt: Date;
    body: string;
    assets: Array<{
        name: string;
        url: string;
        size: number;
        downloadCount: number;
    }>;
    releaseUrl: string;
    isDraft?: boolean;
}
export interface PushCardInput {
    repoName: string;
    branch: string;
    compareUrl: string;
    commits: Array<{
        id: string;
        url: string;
        message: string;
    }>;
    pusher: string;
}
export interface PRCardInput {
    action: string;
    number: number;
    title: string;
    url: string;
    author: string;
    avatarUrl: string;
    body?: string | null;
    aiSummary?: string | null;
}
export interface WebIssueCardInput {
    action: string;
    title: string;
    url: string;
    author: string;
    avatarUrl: string;
    labels: string[];
    body?: string | null;
    aiAnalysis?: string | null;
}
export interface StarCardInput {
    repoName: string;
    url: string;
    starrer: string;
    avatarUrl: string;
}
export interface SecurityCardInput {
    repoFullName: string;
    pusher: string;
    commitHash?: string;
    issues: SecurityIssue[];
}
export declare class CardFactory {
    static createReply(components: V2Component[]): ComponentsV2Reply;
    static createShowcaseCard(input: ShowcaseCardInput): ComponentsV2Reply;
    static createPushCard(input: PushCardInput): ComponentsV2Reply;
    static createPRCard(input: PRCardInput): ComponentsV2Reply;
    static createIssueEventCard(input: WebIssueCardInput): ComponentsV2Reply;
    static createStarCard(input: StarCardInput): ComponentsV2Reply;
    static createLeaderboardCard(input: LeaderboardCardInput): ComponentsV2Reply;
    static createProfileCard(input: ProfileCardInput): ComponentsV2Reply;
    static createIssueCard(input: IssueCardInput): ComponentsV2Reply;
    static createReleaseCard(input: ReleaseCardInput): ComponentsV2Reply;
    static createSecurityCard(input: SecurityCardInput): ComponentsV2Reply;
}
export {};
