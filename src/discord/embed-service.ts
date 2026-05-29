import { EmbedBuilder } from 'discord.js';
import { PushEvent, PullRequestEvent, IssuesEvent, StarEvent } from '../webhooks/schemas.js';
import { InteractionService } from '../database/interaction-service.js';

export class EmbedService {
  private static readonly COLORS = {
    GITHUB: 0x2b2d31,
    PUSH: 0x23a55a,
    PULL_REQUEST: 0x5865f2,
    ISSUE: 0xf57731,
    STAR: 0xfee75c,
    SHOWCASE: 0x9c27b0,
  };

  static createPushEmbed(event: PushEvent) {
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

  static createPREmbed(event: PullRequestEvent, aiSummary?: string | null) {
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

  static createIssueEmbed(event: IssuesEvent, aiAnalysis?: string | null) {
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

  static createStarEmbed(event: StarEvent) {
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

  /**
   * Create a showcase/project card embed
   */
  static async createShowcaseEmbed(
    repository: any,
    stats?: {
      stars?: number;
      forks?: number;
      contributors?: number;
      languages?: string[];
    },
  ) {
    const engagement = await InteractionService.getRepositoryStats(repository.id);

    const embed = new EmbedBuilder()
      .setColor(this.COLORS.SHOWCASE)
      .setTitle(repository.name)
      .setURL(`https://github.com/${repository.fullName}`)
      .setDescription(repository.description || 'No description available')
      .addFields(
        {
          name: '📊 Status',
          value: repository.status || 'Active Development',
          inline: true,
        },
        {
          name: '📁 Repository',
          value: repository.fullName,
          inline: true,
        },
      );

    if (repository.category) {
      embed.addFields({
        name: '🏷️ Category',
        value: repository.category,
        inline: true,
      });
    }

    if (stats?.stars || stats?.forks || stats?.contributors) {
      const statsText = [
        stats.stars ? `⭐ ${stats.stars} stars` : null,
        stats.forks ? `🍴 ${stats.forks} forks` : null,
        stats.contributors ? `👥 ${stats.contributors} contributors` : null,
      ]
        .filter(Boolean)
        .join(' • ');

      embed.addFields({
        name: 'GitHub Stats',
        value: statsText,
        inline: false,
      });
    }

    if (stats?.languages && stats.languages.length > 0) {
      embed.addFields({
        name: '💻 Languages',
        value: stats.languages.slice(0, 5).join(', '),
        inline: false,
      });
    }

    embed.addFields({
      name: '💬 Community Engagement',
      value: `❤️ ${engagement.likes} | 🔖 ${engagement.followers} | 👀 ${engagement.interested} | 💭 ${engagement.comments}`,
      inline: false,
    });

    if (repository.bannerUrl) {
      embed.setImage(repository.bannerUrl);
    }

    embed.setFooter({ text: 'Use buttons below to interact with this project!' });
    embed.setTimestamp();

    return embed;
  }
}
