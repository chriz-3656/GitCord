import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { RepositoryService } from '../database/repository-service.js';
import { CardFactory } from '../discord/ui/cards.js';

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

      await interaction.reply(
        CardFactory.createShowcaseCard({
          repoId: repo.id,
          fullName: updatedRepo.fullName,
          name: updatedRepo.name,
          description: updatedRepo.description,
          bannerUrl: updatedRepo.bannerUrl,
          techStack: updatedRepo.techStack,
          status,
          category: updatedRepo.category,
          likes: repoWithStats?._count.interactions || 0,
          followers: repoWithStats?._count.followers || 0,
          comments: repoWithStats?._count.comments || 0,
        }),
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to generate showcase.',
        ephemeral: true,
      });
    }
  },
};
