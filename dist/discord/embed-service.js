import { EmbedBuilder } from 'discord.js';
export class EmbedService {
    static COLORS = {
        GITHUB: 0x2b2d31,
        PUSH: 0x23a55a,
        PULL_REQUEST: 0x5865f2,
        ISSUE: 0xf57731,
        STAR: 0xfee75c,
    };
    static createPushEmbed(event) {
        const branch = event.ref.split('/').pop();
        const commitCount = event.commits.length;
        const repoName = event.repository.full_name;
        const embed = new EmbedBuilder()
            .setColor(this.COLORS.PUSH)
            .setAuthor({ name: event.pusher.name })
            .setTitle(`[${repoName}:${branch}] ${commitCount} new commit(s)`)
            .setURL(event.compare)
            .setTimestamp();
        const commitList = event.commits
            .slice(0, 5)
            .map((c) => `[\`${c.id.substring(0, 7)}\`](${c.url}) ${c.message.split('\n')[0]}`)
            .join('\n');
        embed.setDescription(commitList || 'No commit details available');
        if (commitCount > 5) {
            embed.setFooter({ text: `...and ${commitCount - 5} more commits` });
        }
        return embed;
    }
    static createPREmbed(event, aiSummary) {
        const action = event.action.charAt(0).toUpperCase() + event.action.slice(1);
        const pr = event.pull_request;
        const embed = new EmbedBuilder()
            .setColor(this.COLORS.PULL_REQUEST)
            .setAuthor({
            name: pr.user.login,
            iconURL: pr.user.avatar_url,
            url: pr.user.html_url,
        })
            .setTitle(`PR ${action}: #${event.number} ${pr.title}`)
            .setURL(pr.html_url)
            .setTimestamp();
        if (pr.body) {
            embed.setDescription(pr.body.substring(0, 256) + (pr.body.length > 256 ? '...' : ''));
        }
        if (aiSummary) {
            embed.addFields({ name: '🤖 AI Summary', value: aiSummary });
        }
        return embed;
    }
    static createIssueEmbed(event, aiAnalysis) {
        const action = event.action.charAt(0).toUpperCase() + event.action.slice(1);
        const issue = event.issue;
        const embed = new EmbedBuilder()
            .setColor(this.COLORS.ISSUE)
            .setAuthor({
            name: issue.user.login,
            iconURL: issue.user.avatar_url,
            url: issue.user.html_url,
        })
            .setTitle(`Issue ${action}: ${issue.title}`)
            .setURL(issue.html_url)
            .setTimestamp();
        if (issue.labels.length > 0) {
            embed.addFields({
                name: 'Labels',
                value: issue.labels.map((l) => `\`${l.name}\``).join(', '),
            });
        }
        if (aiAnalysis) {
            embed.addFields({ name: '🤖 AI Analysis', value: aiAnalysis });
        }
        return embed;
    }
    static createStarEmbed(event) {
        return new EmbedBuilder()
            .setColor(this.COLORS.STAR)
            .setAuthor({
            name: event.sender.login,
            iconURL: event.sender.avatar_url,
            url: event.sender.html_url,
        })
            .setTitle(`⭐ New Star on ${event.repository.full_name}`)
            .setURL(event.repository.html_url)
            .setDescription(`${event.sender.login} just starred the repository!`)
            .setTimestamp();
    }
}
//# sourceMappingURL=embed-service.js.map