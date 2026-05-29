import { EmbedBuilder } from 'discord.js';
import { type ComponentsV2Reply } from '../discord/ui/cards.js';
interface ReleaseAsset {
    name: string;
    url: string;
    size: number;
    downloadCount: number;
}
interface ReleaseData {
    releaseId: string;
    repoId: string;
    version: string;
    tagName: string;
    title: string;
    description: string;
    body: string;
    author: string;
    authorUrl?: string;
    authorAvatar?: string;
    releasedAt: Date;
    isDraft: boolean;
    isPrerelease: boolean;
    assets: ReleaseAsset[];
    releaseUrl: string;
}
export declare class ReleaseService {
    private static octokit;
    private static readonly COLORS;
    /**
     * Track a release in the database
     */
    static trackRelease(releaseData: ReleaseData): Promise<any>;
    /**
     * Get latest releases for a repository
     */
    static getLatestReleases(repoId: string, limit?: number): Promise<any[]>;
    /**
     * Fetch release from GitHub
     */
    static fetchGitHubRelease(owner: string, repo: string, releaseId: string): Promise<any>;
    /**
     * Determine release type badge
     */
    private static determineReleaseType;
    /**
     * Get color for release type
     */
    private static getColorForReleaseType;
    /**
     * Format assets for embed
     */
    private static formatAssets;
    /**
     * Format file size to human readable
     */
    private static formatFileSize;
    /**
     * Format release description (truncate if too long)
     */
    private static formatDescription;
    /**
     * Generate Discord announcement embed for a release
     */
    static generateReleaseAnnouncement(releaseData: ReleaseData): EmbedBuilder;
    /**
     * Generate Discord Components V2 announcement card for a release
     */
    static generateReleaseAnnouncementCard(releaseData: ReleaseData): ComponentsV2Reply;
    /**
     * Parse GitHub release webhook data
     */
    static parseReleaseWebhook(payload: any): Promise<ReleaseData | null>;
    /**
     * Determine which channel to post release to
     */
    static determineReleaseChannel(releaseType: 'STABLE' | 'BETA' | 'RC' | 'PRERELEASE', isDraft: boolean): string;
    /**
     * Check if release should be pinned
     */
    static shouldPinRelease(releaseType: 'STABLE' | 'BETA' | 'RC' | 'PRERELEASE'): boolean;
    /**
     * Generate changelog summary from release body
     */
    static generateChangelogSummary(body: string): string;
    /**
     * Create a threaded announcement for patch releases
     */
    static shouldCreateThread(releaseType: 'STABLE' | 'BETA' | 'RC' | 'PRERELEASE'): boolean;
}
export {};
