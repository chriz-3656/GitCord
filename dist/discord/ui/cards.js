import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, } from 'discord.js';
import { SecuritySeverity } from '../../security/security-service.js';
import { UI_THEMES, ThemeManager } from './themes.js';
const severityColor = (severity) => {
    switch (severity) {
        case SecuritySeverity.CRITICAL:
            return 0xff0000;
        case SecuritySeverity.HIGH:
            return 0xff9500;
        case SecuritySeverity.MEDIUM:
            return 0xffff00;
        default:
            return 0x0099ff;
    }
};
const severityRank = (severity) => {
    switch (severity) {
        case SecuritySeverity.CRITICAL:
            return 0;
        case SecuritySeverity.HIGH:
            return 1;
        case SecuritySeverity.MEDIUM:
            return 2;
        case SecuritySeverity.LOW:
            return 3;
        default:
            return 4;
    }
};
const createText = (content) => new TextDisplayBuilder().setContent(content);
export class CardFactory {
    static createReply(components) {
        return {
            flags: MessageFlags.IsComponentsV2,
            components,
        };
    }
    static createShowcaseCard(input) {
        const status = input.status || 'Active Development';
        const stats = [
            `❤️ ${input.likes ?? 0}`,
            `🔔 ${input.followers ?? 0}`,
            `💭 ${input.comments ?? 0}`,
        ].join(' • ');
        const lines = [
            createText(`**${input.fullName}**`),
            createText(input.description || 'No description provided.'),
            createText([
                `**Status:** ${status}`,
                input.category ? `**Category:** ${input.category}` : null,
                input.techStack ? `**Tech Stack:** ${input.techStack}` : null,
                `**Community:** ${stats}`,
            ]
                .filter(Boolean)
                .join('\n')),
        ];
        const section = new SectionBuilder().addTextDisplayComponents(...lines);
        if (input.bannerUrl) {
            section.setThumbnailAccessory(new ThumbnailBuilder({ media: { url: input.bannerUrl } }));
        }
        const components = [
            new ContainerBuilder()
                .setAccentColor(ThemeManager.getStatusColor(status))
                .addTextDisplayComponents(createText(`🚀 **${input.name}**`))
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
                .addSectionComponents(section),
        ];
        if (input.bannerUrl) {
            components.push(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(input.bannerUrl)));
        }
        components.push(new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setLabel('View Repository')
            .setURL(`https://github.com/${input.fullName}`)
            .setStyle(ButtonStyle.Link), new ButtonBuilder()
            .setLabel('Documentation')
            .setURL(`https://github.com/${input.fullName}#readme`)
            .setStyle(ButtonStyle.Link), new ButtonBuilder()
            .setLabel('Website')
            .setURL(`https://github.com/${input.fullName}`)
            .setStyle(ButtonStyle.Link)), new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`like_${input.repoId}`)
            .setLabel('Like')
            .setEmoji('❤️')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`follow_${input.repoId}`)
            .setLabel('Follow')
            .setEmoji('🔔')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId(`interest_${input.repoId}`)
            .setLabel('Interested')
            .setEmoji('🤝')
            .setStyle(ButtonStyle.Secondary)));
        return this.createReply(components);
    }
    static createPushCard(input) {
        const commitLines = input.commits.length > 0
            ? input.commits
                .slice(0, 5)
                .map((c) => `[\`${c.id.substring(0, 7)}\`](${c.url}) ${c.message.split('\n')[0]}`)
                .join('\n')
            : 'No commit details available.';
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(UI_THEMES.COLORS.SUCCESS)
                .addTextDisplayComponents(createText(`📝 **[${input.repoName}:${input.branch}] ${input.commits.length} new commit(s)**`))
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
                .addSectionComponents(new SectionBuilder().addTextDisplayComponents(createText(`**Pushed by:** ${input.pusher}`), createText(commitLines))),
            new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('Compare Changes')
                .setURL(input.compareUrl)
                .setStyle(ButtonStyle.Link)),
        ]);
    }
    static createPRCard(input) {
        const description = input.body
            ? input.body.substring(0, 512) + (input.body.length > 512 ? '...' : '')
            : 'No description provided.';
        const textParts = [
            createText(`**Author:** ${input.author}`),
            createText(description),
        ];
        if (input.aiSummary) {
            textParts.push(createText(`**AI Summary**\n${input.aiSummary}`));
        }
        const section = new SectionBuilder()
            .addTextDisplayComponents(createText(`🔀 **PR ${input.action.charAt(0).toUpperCase() + input.action.slice(1)}: #${input.number} ${input.title}**`), ...textParts)
            .setThumbnailAccessory(new ThumbnailBuilder({ media: { url: input.avatarUrl } }));
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(UI_THEMES.COLORS.PRIMARY)
                .addSectionComponents(section)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
            new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('Open PR')
                .setURL(input.url)
                .setStyle(ButtonStyle.Link)),
        ]);
    }
    static createIssueEventCard(input) {
        const textParts = [
            createText(`**Author:** ${input.author}`),
            createText(input.labels.length > 0
                ? `**Labels:** ${input.labels.map((l) => `\`${l}\``).join(', ')}`
                : '**Labels:** None'),
            createText(input.body
                ? input.body.substring(0, 512) + (input.body.length > 512 ? '...' : '')
                : 'No description provided.'),
        ];
        if (input.aiAnalysis) {
            textParts.push(createText(`**AI Analysis**\n${input.aiAnalysis}`));
        }
        const section = new SectionBuilder()
            .addTextDisplayComponents(createText(`❗ **Issue ${input.action.charAt(0).toUpperCase() + input.action.slice(1)}: ${input.title}**`), ...textParts)
            .setThumbnailAccessory(new ThumbnailBuilder({ media: { url: input.avatarUrl } }));
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(UI_THEMES.COLORS.WARNING)
                .addSectionComponents(section)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
            new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('Open Issue')
                .setURL(input.url)
                .setStyle(ButtonStyle.Link)),
        ]);
    }
    static createStarCard(input) {
        const section = new SectionBuilder()
            .addTextDisplayComponents(createText(`⭐ **New Star on ${input.repoName}**`), createText(`**Starred by:** ${input.starrer}`), createText('A community member just starred this repository.'))
            .setThumbnailAccessory(new ThumbnailBuilder({ media: { url: input.avatarUrl } }));
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(UI_THEMES.COLORS.STAR)
                .addSectionComponents(section)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
            new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('View Repository')
                .setURL(input.url)
                .setStyle(ButtonStyle.Link)),
        ]);
    }
    static createLeaderboardCard(input) {
        const lines = input.items.length > 0 ? input.items : ['No results yet.'];
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(input.accentColor ?? UI_THEMES.COLORS.PRIMARY)
                .addTextDisplayComponents(createText(`🏆 **${input.title}**`), createText(input.subtitle), createText(lines.join('\n')))
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
        ]);
    }
    static createProfileCard(input) {
        const badgesText = input.badges.length > 0 ? input.badges.join('\n') : 'No achievements yet.';
        const section = new SectionBuilder()
            .addTextDisplayComponents(createText(`👤 **${input.username}**`), createText(`**Tier:** ${input.tier}`), createText(`**Reputation:** ${input.reputation} points`), createText([
            `📝 Commits: ${input.commits}`,
            `🔀 PRs: ${input.prs} (${input.mergedPrs} merged)`,
            `❗ Issues: ${input.issues}`,
            `⭐ Stars: ${input.stars}`,
            `🤝 Helpful reviews: ${input.helpfulReviews}`,
        ].join('\n')), createText(`**Achievements**\n${badgesText}`))
            .setThumbnailAccessory(new ThumbnailBuilder({ media: { url: input.avatarUrl } }));
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(UI_THEMES.COLORS.PRIMARY)
                .addSectionComponents(section)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
        ]);
    }
    static createIssueCard(input) {
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(UI_THEMES.COLORS.SUCCESS)
                .addTextDisplayComponents(createText(`🌱 **${input.title}**`), createText(input.subtitle), createText(input.items.join('\n\n')))
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
        ]);
    }
    static createReleaseCard(input) {
        const assetLines = input.assets.length > 0
            ? input.assets
                .slice(0, 5)
                .map((asset) => `• [${asset.name}](${asset.url}) — ${asset.size > 0 ? `${Math.round(asset.size / 1024)} KB` : 'unknown size'} | ⬇️ ${asset.downloadCount}`)
                .join('\n')
            : 'No assets available.';
        const section = new SectionBuilder()
            .addTextDisplayComponents(createText(`🚀 **${input.title}**`), createText(`**Version:** \`${input.version}\` • **Tag:** \`${input.tagName}\` • **Type:** ${input.type}`), createText(`**Released:** <t:${Math.floor(input.releasedAt.getTime() / 1000)}:R>`), createText(input.body || 'No changelog provided.'), createText(`**Downloads**\n${assetLines}`))
            .setThumbnailAccessory(new ThumbnailBuilder({
            media: { url: input.authorAvatar || 'https://github.com/github.png' },
        }));
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(input.isDraft ? UI_THEMES.COLORS.WARNING : UI_THEMES.COLORS.SUCCESS)
                .addSectionComponents(section)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
            new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('Release Notes')
                .setURL(input.releaseUrl)
                .setStyle(ButtonStyle.Link), new ButtonBuilder()
                .setLabel('Author')
                .setURL(input.authorUrl || input.releaseUrl)
                .setStyle(ButtonStyle.Link)),
        ]);
    }
    static createSecurityCard(input) {
        if (input.issues.length === 0) {
            const section = new SectionBuilder().addTextDisplayComponents(createText('✅ **Security Scan Passed**'), createText(`No security issues detected in **${input.repoFullName}**`), createText(`**Pushed by:** ${input.pusher}`));
            return this.createReply([
                new ContainerBuilder()
                    .setAccentColor(UI_THEMES.COLORS.SUCCESS)
                    .addSectionComponents(section)
                    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
            ]);
        }
        const sorted = [...input.issues].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
        const highest = sorted[0];
        const summary = [
            `🔴 Critical: ${sorted.filter((i) => i.severity === SecuritySeverity.CRITICAL).length}`,
            `🟠 High: ${sorted.filter((i) => i.severity === SecuritySeverity.HIGH).length}`,
            `🟡 Medium: ${sorted.filter((i) => i.severity === SecuritySeverity.MEDIUM).length}`,
            `🔵 Low: ${sorted.filter((i) => i.severity === SecuritySeverity.LOW).length}`,
        ].join(' • ');
        const issueText = sorted
            .map((issue) => `**${issue.type}** — ${issue.severity}\n${issue.description}\nFix: ${issue.remediation}${issue.details ? `\nDetails: \`${issue.details}\`` : ''}`)
            .join('\n\n');
        const section = new SectionBuilder().addTextDisplayComponents(createText(`⚠️ **Security Alert - ${highest.severity}**`), createText(`**Repository:** ${input.repoFullName}`), createText(`**Pushed by:** ${input.pusher}`), createText(`**Findings:** ${input.issues.length}`), createText(`**Summary**\n${summary}`), createText(`**Issues**\n${issueText}`));
        return this.createReply([
            new ContainerBuilder()
                .setAccentColor(severityColor(highest.severity))
                .addSectionComponents(section)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
            new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('Security Docs')
                .setURL('https://docs.github.com/en/code-security')
                .setStyle(ButtonStyle.Link), new ButtonBuilder()
                .setLabel('Secret Scanning')
                .setURL('https://docs.github.com/en/code-security/secret-scanning')
                .setStyle(ButtonStyle.Link)),
        ]);
    }
}
//# sourceMappingURL=cards.js.map