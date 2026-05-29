import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { LeaderboardService } from '../database/leaderboard-service.js';

export const LeaderboardCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View community leaderboards')
    .addSubcommand((sub) =>
      sub.setName('contributors').setDescription('Top contributors by reputation'),
    )
    .addSubcommand((sub) =>
      sub.setName('trending').setDescription('Trending repositories (last 7 days)'),
    )
    .addSubcommand((sub) => sub.setName('stars').setDescription('Most starred projects'))
    .addSubcommand((sub) => sub.setName('active').setDescription('Most active projects'))
    .addSubcommand((sub) =>
      sub.setName('repo-of-week').setDescription("This week's featured repository"),
    )
    .addSubcommand((sub) => sub.setName('helpful').setDescription('Most helpful contributors'))
    .addSubcommand((sub) =>
      sub.setName('hall-of-fame').setDescription('Hall of fame - all-time top contributors'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('category')
        .setDescription('Ranking by category')
        .addStringOption((opt) =>
          opt
            .setName('category')
            .setDescription('Category: AI, Cybersecurity, Minecraft, GameDev, WebDev, MobileDev')
            .setRequired(true)
            .addChoices(
              { name: 'AI', value: 'ai' },
              { name: 'Cybersecurity', value: 'cybersecurity' },
              { name: 'Minecraft', value: 'minecraft' },
              { name: 'Game Development', value: 'gamedev' },
              { name: 'Web Development', value: 'webdev' },
              { name: 'Mobile Development', value: 'mobiledev' },
            ),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'contributors': {
          const leaders = await LeaderboardService.getTopContributors(10);

          if (leaders.length === 0) {
            return interaction.reply('No contributors yet.');
          }

          const embed = new EmbedBuilder()
            .setTitle('🏆 Top Contributors')
            .setColor(0xfee75c)
            .setDescription(
              leaders
                .map(
                  (c) =>
                    `${c.position}. **${c.name}** — ${c.value} reputation\n` +
                    `   ↳ ${c.metadata?.commits || 0} commits, ${c.metadata?.prs || 0} PRs`,
                )
                .join('\n'),
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'trending': {
          const trending = await LeaderboardService.getTrendingRepositories(10);

          if (trending.length === 0) {
            return interaction.reply('No trending repos yet.');
          }

          const embed = new EmbedBuilder()
            .setTitle('🔥 Trending Repositories (7 days)')
            .setColor(0xff6b6b)
            .setDescription(
              trending
                .map((r) => `${r.position}. **${r.fullName}** — ${r.value} events`)
                .join('\n'),
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'stars': {
          const starred = await LeaderboardService.getMostStarredProjects(10);

          if (starred.length === 0) {
            return interaction.reply('No starred repos yet.');
          }

          const embed = new EmbedBuilder()
            .setTitle('⭐ Most Starred Projects')
            .setColor(0xffd700)
            .setDescription(
              starred.map((r) => `${r.position}. **${r.fullName}** — ${r.value} ⭐`).join('\n'),
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'active': {
          const active = await LeaderboardService.getMostActiveProjects(10);

          if (active.length === 0) {
            return interaction.reply('No active repos yet.');
          }

          const embed = new EmbedBuilder()
            .setTitle('⚡ Most Active Projects')
            .setColor(0x00ff00)
            .setDescription(
              active.map((r) => `${r.position}. **${r.fullName}** — ${r.value} events`).join('\n'),
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'repo-of-week': {
          const rotw = await LeaderboardService.getRepoOfTheWeek();

          if (!rotw) {
            return interaction.reply('No repo selected for this week yet.');
          }

          const embed = new EmbedBuilder()
            .setTitle('🌟 Repo of the Week')
            .setColor(0x9c27b0)
            .setDescription(
              `**${rotw.fullName}**\n\n${rotw.description || 'No description available.'}\n\nEngagement Score: ${rotw.value.toFixed(1)}`,
            )
            .setTimestamp();

          if (rotw.bannerUrl) {
            embed.setImage(rotw.bannerUrl);
          }

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'helpful': {
          const helpful = await LeaderboardService.getMostHelpfulContributors(10);

          if (helpful.length === 0) {
            return interaction.reply('No helpful contributors yet.');
          }

          const embed = new EmbedBuilder()
            .setTitle('🤝 Most Helpful Contributors')
            .setColor(0x00aaff)
            .setDescription(
              helpful
                .map(
                  (c) =>
                    `${c.position}. **${c.name}** — ${c.metadata?.helpfulReviews || 0} reviews, ${c.metadata?.issuesResolved || 0} issues`,
                )
                .join('\n'),
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'hall-of-fame': {
          const fame = await LeaderboardService.getHallOfFame(15);

          if (fame.length === 0) {
            return interaction.reply('Hall of fame is empty.');
          }

          const embed = new EmbedBuilder()
            .setTitle('🏅 Hall of Fame')
            .setColor(0xff6b9d)
            .setDescription(
              fame
                .map((c) => `${c.position}. **${c.name}** — ${c.value} reputation points`)
                .join('\n'),
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'category': {
          const category = interaction.options.getString('category', true);
          const catLeaders = await LeaderboardService.getCategoryRanking(category, 10);

          if (catLeaders.length === 0) {
            return interaction.reply(`No projects in the ${category.toUpperCase()} category yet.`);
          }

          const categoryNames: Record<string, string> = {
            ai: '🤖 AI',
            cybersecurity: '🔐 Cybersecurity',
            minecraft: '⛏️ Minecraft',
            gamedev: '🎮 Game Development',
            webdev: '🌐 Web Development',
            mobiledev: '📱 Mobile Development',
          };

          const embed = new EmbedBuilder()
            .setTitle(`${categoryNames[category] || category.toUpperCase()} Projects`)
            .setColor(0xaa00ff)
            .setDescription(catLeaders.map((r) => `${r.position}. **${r.fullName}**`).join('\n'))
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to fetch leaderboard.',
        ephemeral: true,
      });
    }
  },
};
