import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { IssueService } from '../services/issue-service.js';
import { RepositoryService } from '../database/repository-service.js';

export const GoodFirstIssuesCommand = {
  data: new SlashCommandBuilder()
    .setName('good-first-issues')
    .setDescription('Find beginner-friendly issues in registered repositories')
    .addStringOption((opt) =>
      opt
        .setName('language')
        .setDescription('Filter by programming language')
        .addChoices(
          { name: 'JavaScript', value: 'javascript' },
          { name: 'TypeScript', value: 'typescript' },
          { name: 'Python', value: 'python' },
          { name: 'Go', value: 'go' },
          { name: 'Rust', value: 'rust' },
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const language = interaction.options.getString('language');
      let issues = [];

      if (language) {
        // Search by language across GitHub
        issues = await IssueService.searchIssuesByLanguage(language, 10);
      } else {
        // Get from registered repos in guild
        const repos = await RepositoryService.listRepositories(interaction.guildId!);

        if (repos.length === 0) {
          return interaction.editReply(
            '❌ No repositories registered. Use `/register-repo` first.',
          );
        }

        // Fetch issues from each repo
        for (const repo of repos.slice(0, 5)) {
          const [owner, name] = repo.fullName.split('/');
          const repoIssues = await IssueService.getGoodFirstIssues(owner, name, 3);
          issues.push(...repoIssues.map((i) => ({ ...i, repo: repo.fullName })));
        }
      }

      if (issues.length === 0) {
        return interaction.editReply('😅 No beginner-friendly issues found at the moment.');
      }

      // Sort by difficulty
      issues.sort((a, b) => (a.difficulty === 'beginner' ? -1 : 1));

      const embed = new EmbedBuilder()
        .setTitle('🌱 Beginner-Friendly Issues')
        .setColor(0x43b581)
        .setDescription(
          language ? `Showing open issues in **${language}**` : 'From your registered repositories',
        );

      // Group by difficulty
      const byDifficulty = {
        beginner: [] as any[],
        intermediate: [] as any[],
        advanced: [] as any[],
      };
      for (const issue of issues) {
        byDifficulty[issue.difficulty].push(issue);
      }

      // Add fields for each difficulty
      if (byDifficulty.beginner.length > 0) {
        embed.addFields({
          name: '🟢 Beginner (Perfect to start)',
          value: byDifficulty.beginner
            .slice(0, 5)
            .map(
              (i) =>
                `• [${i.title}](${i.url}) \`${i.repo}\`${i.requiredSkills.length > 0 ? ` - **${i.requiredSkills.slice(0, 2).join(', ')}**` : ''}`,
            )
            .join('\n'),
          inline: false,
        });
      }

      if (byDifficulty.intermediate.length > 0) {
        embed.addFields({
          name: '🟡 Intermediate (Some experience)',
          value: byDifficulty.intermediate
            .slice(0, 3)
            .map((i) => `• [${i.title}](${i.url}) \`${i.repo}\``)
            .join('\n'),
          inline: false,
        });
      }

      embed.addFields({
        name: '💡 How to Contribute',
        value:
          '1. Pick an issue\n2. Check the repo README\n3. Leave a comment expressing interest\n4. Submit your PR!',
        inline: false,
      });

      embed.setFooter({ text: `Found ${issues.length} issues • Good luck contributing! 🚀` });
      embed.setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Failed to fetch issues. Check GitHub API access.');
    }
  },
};
