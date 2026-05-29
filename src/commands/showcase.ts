import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { LayoutService } from '../discord/ui/layouts.js';
import { ButtonFactory } from '../discord/ui/components.js';
import { RepositoryService } from '../database/repository-service.js';
import { ThemeManager, UI_THEMES } from '../discord/ui/themes.js';

export const ShowcaseCommand = {
  data: new SlashCommandBuilder()
    .setName('showcase')
    .setDescription('Share and update your project showcase')
    .addStringOption((option) =>
      option
        .setName('repo-full-name')
        .setDescription('The owner/repo of the project')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('Custom project summary'),
    )
    .addStringOption((option) =>
      option.setName('tech-stack').setDescription('E.g. Node.js, Tailwind'),
    )
    .addStringOption((option) =>
      option
        .setName('status')
        .setDescription('Current status of the project')
        .addChoices(
          { name: 'Active Development', value: 'Active Development' },
          { name: 'Looking for Contributors', value: 'Looking for Contributors' },
          { name: 'Beta Testing', value: 'Beta Testing' },
          { name: 'Maintenance Mode', value: 'Maintenance Mode' },
          { name: 'Archived', value: 'Archived' },
        ),
    )
    .addStringOption((option) =>
      option.setName('banner-url').setDescription('URL to a project banner image'),
    )
    .addStringOption((option) =>
      option
        .setName('request-role')
        .setDescription('Request specific contributors (e.g. Frontend, Tester)')
        .addChoices(
          { name: 'Frontend Developer', value: 'Frontend Developer' },
          { name: 'Backend Developer', value: 'Backend Developer' },
          { name: 'Fullstack Developer', value: 'Fullstack Developer' },
          { name: 'UI/UX Designer', value: 'UI/UX Designer' },
          { name: 'Security Researcher', value: 'Security Researcher' },
          { name: 'Tester', value: 'Tester' },
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const fullName = interaction.options.getString('repo-full-name', true);
    const description = interaction.options.getString('description');
    const techStack = interaction.options.getString('tech-stack');
    const status = interaction.options.getString('status') || 'Active Development';
    const bannerUrl = interaction.options.getString('banner-url');
    const requestRole = interaction.options.getString('request-role');

    try {
      const repo = await RepositoryService.getRepositoryByFullName(fullName);

      if (!repo) {
        return interaction.reply({
          content: `❌ Repository **${fullName}** is not registered. Run \`/register-repo\` first.`,
          ephemeral: true,
        });
      }

      // Update metadata
      const updatedRepo = await RepositoryService.updateMetadata(repo.id, {
        description: description || undefined,
        techStack: techStack || undefined,
        status,
        bannerUrl: bannerUrl || undefined,
      });

      const repoWithStats = await RepositoryService.getRepositoryWithStats(repo.id);

      const embed = LayoutService.createBaseEmbed(
        `🚀 Project Showcase: ${updatedRepo.name}`,
        ThemeManager.getStatusColor(status),
      );

      LayoutService.addHeader(embed, updatedRepo.fullName, UI_THEMES.EMOJIS.REPO);

      if (updatedRepo.bannerUrl) {
        embed.setImage(updatedRepo.bannerUrl);
      }

      embed.setDescription(updatedRepo.description || 'No description provided.');

      LayoutService.addMetaGrid(embed, [
        { label: '🛠 Tech Stack', value: updatedRepo.techStack || 'Not specified' },
        { label: '📊 Status', value: status },
        { label: '❤️ Likes', value: repoWithStats?._count.interactions || 0 },
        { label: '🔔 Followers', value: repoWithStats?._count.followers || 0 },
      ]);

      const socialRow = ButtonFactory.createSocialRow(repo.id);
      const linkRow = ButtonFactory.createLinkRow({
        github: `https://github.com/${updatedRepo.fullName}`,
      });

      await interaction.reply({
        embeds: [embed],
        components: [socialRow, linkRow],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to generate showcase.',
        ephemeral: true,
      });
    }
  },
};
