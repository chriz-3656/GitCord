import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ContributorService } from '../database/contributor-service.js';
import { AchievementService } from '../database/achievement-service.js';
import { LayoutService } from '../discord/ui/layouts.js';
import { UI_THEMES } from '../discord/ui/themes.js';

export const ProfileCommand = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your developer profile and reputation')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to view (optional)'),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    try {
      const profile = await ContributorService.getProfileByDiscordId(targetUser.id);

      if (!profile) {
        return interaction.reply({
          content:
            targetUser.id === interaction.user.id
              ? "You don't have a profile yet. Start contributing to a registered repo!"
              : "This user doesn't have a profile yet.",
          ephemeral: true,
        });
      }

      // Create main profile embed
      const embed = new EmbedBuilder()
        .setTitle(`👤 ${profile.username}`)
        .setColor(UI_THEMES.COLORS.PRIMARY)
        .setThumbnail(profile.avatarUrl || targetUser.displayAvatarURL());

      // Reputation section
      embed.addFields({
        name: '🏆 Reputation Score',
        value: `**${profile.reputation}** points`,
        inline: true,
      });

      // Contribution stats
      embed.addFields({
        name: '📊 Contributions',
        value:
          `📝 **${profile.commits}** commits\n` +
          `🔀 **${profile.prs}** PRs (${profile.mergedPrs} merged)\n` +
          `❗ **${profile.issues}** issues\n` +
          `⭐ **${profile.stars}** stars`,
        inline: true,
      });

      // Helpful contributions
      embed.addFields({
        name: '🤝 Community',
        value:
          `💬 **${profile.helpfulReviews}** helpful reviews\n` +
          `🎯 Reputation Breakdown:` +
          `\`\`\`\n` +
          `Commits: ${profile.commits * 1}\n` +
          `Merged PRs: ${profile.mergedPrs * 5}\n` +
          `Issues: ${profile.issues * 3}\n` +
          `Reviews: ${profile.helpfulReviews * 2}\n` +
          `\`\`\``,
        inline: false,
      });

      // Achievements/Badges
      const badges = await AchievementService.getContributorBadges(profile.id);
      if (badges.length > 0) {
        const badgeText = badges
          .map(
            (b) =>
              `${AchievementService.getRarityEmoji(b.rarity)} **${b.name}** - ${b.description}`,
          )
          .join('\n');

        embed.addFields({
          name: `🏅 Achievements (${badges.length})`,
          value: badgeText,
          inline: false,
        });
      } else {
        embed.addFields({
          name: '🏅 Achievements',
          value: 'No achievements yet. Keep contributing!',
          inline: false,
        });
      }

      // Activity indicator
      const tier = this.getReputationTier(profile.reputation);
      embed.addFields({
        name: '⚡ Tier',
        value: tier,
        inline: true,
      });

      embed.setFooter({
        text: 'Keep contributing to earn more reputation and badges!',
      });
      embed.setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to fetch profile.',
        ephemeral: true,
      });
    }
  },

  getReputationTier(reputation: number): string {
    if (reputation >= 1000) return '🌟 Legend';
    if (reputation >= 500) return '⭐ Elite';
    if (reputation >= 250) return '🟢 Expert';
    if (reputation >= 100) return '🔵 Advanced';
    if (reputation >= 50) return '🟡 Intermediate';
    return '🔴 Beginner';
  },
};
