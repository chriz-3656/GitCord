import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { ContributorService } from '../database/contributor-service.js';

export const LeaderboardCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top contributors across all registered repositories'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const topUsers = await ContributorService.getLeaderboard();

      if (topUsers.length === 0) {
        return interaction.reply('No contribution data available yet.');
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 Contributor Leaderboard')
        .setColor(0xfee75c)
        .setDescription(
          topUsers
            .map(
              (u, i) =>
                `${i + 1}. **${u.username}** — ${u.commits} commits, ${u.prs} PRs`,
            )
            .join('\n'),
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to fetch leaderboard.',
        ephemeral: true,
      });
    }
  },
};
