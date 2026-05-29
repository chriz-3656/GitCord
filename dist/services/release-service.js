import { Octokit } from 'octokit';
import { EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import pino from 'pino';
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});
export class ReleaseService {
    static octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
    static COLORS = {
        STABLE: 0x23a55a,
        BETA: 0xf26522,
        RC: 0x5865f2,
        PRERELEASE: 0xfaa61a,
    };
    /**
     * Track a release in the database
     */
    static async trackRelease(releaseData) {
        try {
            const release = await prisma.release.upsert({
                where: { releaseId: releaseData.releaseId },
                update: {
                    title: releaseData.title,
                    description: releaseData.description,
                    body: releaseData.body,
                    assets: releaseData.assets,
                    updatedAt: new Date(),
                },
                create: {
                    releaseId: releaseData.releaseId,
                    repoId: releaseData.repoId,
                    version: releaseData.version,
                    tagName: releaseData.tagName,
                    title: releaseData.title,
                    description: releaseData.description,
                    body: releaseData.body,
                    author: releaseData.author,
                    authorUrl: releaseData.authorUrl,
                    authorAvatar: releaseData.authorAvatar,
                    releasedAt: releaseData.releasedAt,
                    isDraft: releaseData.isDraft,
                    isPrerelease: releaseData.isPrerelease,
                    assets: releaseData.assets,
                    releaseUrl: releaseData.releaseUrl,
                },
            });
            logger.info(`Tracked release: ${releaseData.version} for ${releaseData.repoId}`);
            return release;
        }
        catch (error) {
            logger.error(`Error tracking release: ${releaseData.version}`, error);
            throw error;
        }
    }
    /**
     * Get latest releases for a repository
     */
    static async getLatestReleases(repoId, limit = 5) {
        try {
            const releases = await prisma.release.findMany({
                where: { repoId },
                orderBy: { releasedAt: 'desc' },
                take: limit,
            });
            return releases;
        }
        catch (error) {
            logger.error(`Error fetching latest releases for ${repoId}:`, error);
            return [];
        }
    }
    /**
     * Fetch release from GitHub
     */
    static async fetchGitHubRelease(owner, repo, releaseId) {
        try {
            const response = await this.octokit.rest.repos.getRelease({
                owner,
                repo,
                release_id: Number(releaseId),
            });
            return response.data;
        }
        catch (error) {
            logger.error(`Error fetching GitHub release ${releaseId}:`, error);
            return null;
        }
    }
    /**
     * Determine release type badge
     */
    static determineReleaseType(version, isPrerelease) {
        const versionLower = version.toLowerCase();
        if (versionLower.includes('rc'))
            return 'RC';
        if (versionLower.includes('beta') || versionLower.includes('b'))
            return 'BETA';
        if (isPrerelease)
            return 'PRERELEASE';
        return 'STABLE';
    }
    /**
     * Get color for release type
     */
    static getColorForReleaseType(type) {
        return this.COLORS[type] || this.COLORS.STABLE;
    }
    /**
     * Format assets for embed
     */
    static formatAssets(assets) {
        if (!assets || assets.length === 0) {
            return 'No assets available';
        }
        return assets
            .slice(0, 5)
            .map((asset) => `[📦 ${asset.name}](${asset.url}) - ${this.formatFileSize(asset.size)} | ⬇️ ${asset.downloadCount}`)
            .join('\n') + (assets.length > 5 ? `\n...and ${assets.length - 5} more` : '');
    }
    /**
     * Format file size to human readable
     */
    static formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    /**
     * Format release description (truncate if too long)
     */
    static formatDescription(description) {
        const maxLength = 2048;
        if (!description)
            return 'No description provided';
        // Remove markdown links for better display
        let formatted = description
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
            .substring(0, maxLength);
        if (description.length > maxLength) {
            formatted += '...';
        }
        return formatted;
    }
    /**
     * Generate Discord announcement embed for a release
     */
    static generateReleaseAnnouncement(releaseData) {
        const releaseType = this.determineReleaseType(releaseData.version, releaseData.isPrerelease);
        const color = this.getColorForReleaseType(releaseType);
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`🚀 Release: ${releaseData.title}`)
            .setURL(releaseData.releaseUrl)
            .setAuthor({
            name: releaseData.author,
            iconURL: releaseData.authorAvatar || undefined,
            url: releaseData.authorUrl || undefined,
        })
            .setDescription(this.formatDescription(releaseData.body || releaseData.description))
            .addFields({
            name: '📌 Version',
            value: `\`${releaseData.version}\``,
            inline: true,
        }, {
            name: '🏷️ Tag',
            value: `\`${releaseData.tagName}\``,
            inline: true,
        }, {
            name: '🎯 Type',
            value: `\`${releaseType}\``,
            inline: true,
        }, {
            name: '📅 Released',
            value: `<t:${Math.floor(releaseData.releasedAt.getTime() / 1000)}:R>`,
            inline: true,
        });
        // Add assets if available
        if (releaseData.assets && releaseData.assets.length > 0) {
            embed.addFields({
                name: '📦 Downloads',
                value: this.formatAssets(releaseData.assets),
                inline: false,
            });
        }
        // Add badges
        const badges = [];
        if (releaseType === 'STABLE')
            badges.push('🟢 STABLE');
        if (releaseType === 'BETA')
            badges.push('🟠 BETA');
        if (releaseType === 'RC')
            badges.push('🟡 RC');
        if (releaseType === 'PRERELEASE')
            badges.push('🔴 PRERELEASE');
        if (releaseData.isDraft)
            badges.push('📝 DRAFT');
        if (badges.length > 0) {
            embed.addFields({
                name: 'Status',
                value: badges.join(' | '),
                inline: false,
            });
        }
        embed.setTimestamp(releaseData.releasedAt).setFooter({
            text: `GitCord Release Tracker • ${releaseData.repoId}`,
        });
        return embed;
    }
    /**
     * Parse GitHub release webhook data
     */
    static async parseReleaseWebhook(payload) {
        try {
            const release = payload.release;
            const repository = payload.repository;
            if (!release) {
                logger.warn('Release webhook missing release data');
                return null;
            }
            const assets = (release.assets || []).map((asset) => ({
                name: asset.name,
                url: asset.browser_download_url,
                size: asset.size,
                downloadCount: asset.download_count || 0,
            }));
            // Extract version from tag
            const tagName = release.tag_name;
            const version = tagName.startsWith('v') ? tagName.substring(1) : tagName;
            return {
                releaseId: String(release.id),
                repoId: repository.full_name,
                version,
                tagName,
                title: release.name || tagName,
                description: release.body?.split('\n')[0] || 'Release',
                body: release.body || '',
                author: release.author.login,
                authorUrl: release.author.html_url,
                authorAvatar: release.author.avatar_url,
                releasedAt: new Date(release.published_at),
                isDraft: release.draft,
                isPrerelease: release.prerelease,
                assets,
                releaseUrl: release.html_url,
            };
        }
        catch (error) {
            logger.error('Error parsing release webhook:', error);
            return null;
        }
    }
    /**
     * Determine which channel to post release to
     */
    static determineReleaseChannel(releaseType, isDraft) {
        if (isDraft)
            return 'releases-drafts';
        if (releaseType === 'STABLE')
            return 'releases';
        if (releaseType === 'PRERELEASE' || releaseType === 'BETA')
            return 'releases-beta';
        if (releaseType === 'RC')
            return 'releases-rc';
        return 'releases';
    }
    /**
     * Check if release should be pinned
     */
    static shouldPinRelease(releaseType) {
        return releaseType === 'STABLE';
    }
    /**
     * Generate changelog summary from release body
     */
    static generateChangelogSummary(body) {
        if (!body)
            return 'No changelog provided';
        // Extract sections like "## Changes", "### Features", etc.
        const lines = body.split('\n');
        let summary = '';
        let lineCount = 0;
        for (const line of lines) {
            if (lineCount >= 15)
                break;
            if (line.trim().length > 0) {
                summary += line + '\n';
                lineCount++;
            }
        }
        return summary || 'No changelog provided';
    }
    /**
     * Create a threaded announcement for patch releases
     */
    static shouldCreateThread(releaseType) {
        return releaseType === 'STABLE';
    }
}
//# sourceMappingURL=release-service.js.map