import { EmbedBuilder } from 'discord.js';
import { SecurityService, SecuritySeverity } from '../security/security-service.js';
export class SecurityAlertService {
    static REMEDIATION_LINKS = {
        'Exposed .env file': 'https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files',
        'AWS Access Key': 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
        'Private Key File': 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh',
        'Database Connection String': 'https://12factor.net/config',
        'Password in Plain Text': 'https://owasp.org/www-community/attacks/Brute_force_attack',
    };
    static createSecurityAlertEmbed(repoFullName, issues, pusher, commitHash) {
        if (issues.length === 0) {
            return new EmbedBuilder()
                .setColor(0x00aa00)
                .setTitle('✅ Security Scan Passed')
                .setDescription(`No security issues detected in push to **${repoFullName}**`)
                .addFields({ name: 'Pushed By', value: pusher, inline: true })
                .setTimestamp()
                .setFooter({ text: 'GitCord Security Monitor' });
        }
        // Sort issues by severity (CRITICAL first)
        const severityOrder = {
            [SecuritySeverity.CRITICAL]: 0,
            [SecuritySeverity.HIGH]: 1,
            [SecuritySeverity.MEDIUM]: 2,
            [SecuritySeverity.LOW]: 3,
        };
        const sortedIssues = issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        // Get the highest severity for embed color
        const highestSeverity = sortedIssues[0].severity;
        const embedColor = SecurityService.getSeverityColor(highestSeverity);
        // Build the embed
        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`⚠️ SECURITY ALERT - ${highestSeverity}`)
            .setDescription(`Security issues detected in a push to **${repoFullName}**`)
            .addFields({ name: 'Pushed By', value: pusher, inline: true }, { name: 'Issues Found', value: issues.length.toString(), inline: true });
        if (commitHash) {
            embed.addFields({ name: 'Commit', value: `\`${commitHash.substring(0, 7)}\``, inline: true });
        }
        // Add each issue as a field
        for (const issue of sortedIssues) {
            const badge = SecurityService.getSeverityBadge(issue.severity);
            const fieldValue = [
                `**Severity:** ${badge} ${issue.severity}`,
                `**Issue:** ${issue.description}`,
                `**Fix:** ${issue.remediation}`,
                ...(issue.details ? [`**Details:** \`${issue.details}\``] : []),
            ].join('\n');
            embed.addFields({
                name: issue.type,
                value: fieldValue,
                inline: false,
            });
        }
        // Add footer with timestamp
        embed
            .setTimestamp()
            .setFooter({ text: 'GitCord Security Monitor | Immediate action recommended' });
        return embed;
    }
    static createSecurityReportEmbed(repoFullName, issues, _pusher) {
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`🔐 Security Report - ${repoFullName}`)
            .setDescription('Detailed security analysis of recent push');
        // Summary section
        const critical = issues.filter((i) => i.severity === SecuritySeverity.CRITICAL).length;
        const high = issues.filter((i) => i.severity === SecuritySeverity.HIGH).length;
        const medium = issues.filter((i) => i.severity === SecuritySeverity.MEDIUM).length;
        const low = issues.filter((i) => i.severity === SecuritySeverity.LOW).length;
        embed.addFields({
            name: '📊 Summary',
            value: [
                `🔴 Critical: ${critical}`,
                `🟠 High: ${high}`,
                `🟡 Medium: ${medium}`,
                `🔵 Low: ${low}`,
            ].join('\n'),
            inline: false,
        });
        // Top recommendations
        if (critical > 0) {
            const criticalIssues = issues.filter((i) => i.severity === SecuritySeverity.CRITICAL);
            embed.addFields({
                name: '⚠️ IMMEDIATE ACTION REQUIRED',
                value: criticalIssues.map((i) => `• **${i.type}**: ${i.remediation}`).join('\n'),
                inline: false,
            });
        }
        // Next steps
        embed.addFields({
            name: '📋 Recommended Actions',
            value: [
                '1. Review all security findings above',
                '2. Remediate critical issues immediately',
                '3. Rotate any exposed credentials',
                '4. Enable branch protection rules',
                '5. Set up pre-commit hooks for secret scanning',
            ].join('\n'),
            inline: false,
        });
        embed.setTimestamp().setFooter({ text: 'GitCord Security Monitor' });
        return embed;
    }
    static async formatSecurityAlert(repoFullName, issues, pusher, commitHash) {
        const mainEmbed = this.createSecurityAlertEmbed(repoFullName, issues, pusher, commitHash);
        // Add detailed report if there are issues
        if (issues.length > 0) {
            const reportEmbed = this.createSecurityReportEmbed(repoFullName, issues, pusher);
            return {
                embeds: [mainEmbed, reportEmbed],
                hasIssues: true,
            };
        }
        return {
            embeds: [mainEmbed],
            hasIssues: false,
        };
    }
}
//# sourceMappingURL=security-alert-service.js.map