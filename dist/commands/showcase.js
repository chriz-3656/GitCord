import { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle, } from 'discord.js';
import { RepositoryService } from '../database/repository-service.js';
import { CardFactory } from '../discord/ui/cards.js';
export const ShowcaseCommand = {
    data: new SlashCommandBuilder()
        .setName('showcase')
        .setDescription('Share and update your project showcase')
        .addStringOption((option) => option
        .setName('repo-full-name')
        .setDescription('The owner/repo of the project')
        .setRequired(true))
        .addStringOption((option) => option.setName('description').setDescription('Custom project summary'))
        .addStringOption((option) => option.setName('tech-stack').setDescription('E.g. Node.js, Tailwind'))
        .addStringOption((option) => option
        .setName('status')
        .setDescription('Current status of the project')
        .addChoices({ name: 'Active Development', value: 'Active Development' }, { name: 'Looking for Contributors', value: 'Looking for Contributors' }, { name: 'Beta Testing', value: 'Beta Testing' }, { name: 'Maintenance Mode', value: 'Maintenance Mode' }, { name: 'Archived', value: 'Archived' }))
        .addStringOption((option) => option.setName('banner-url').setDescription('URL to a project banner image'))
        .addStringOption((option) => option
        .setName('request-role')
        .setDescription('Request specific contributors (e.g. Frontend, Tester)')
        .addChoices({ name: 'Frontend Developer', value: 'Frontend Developer' }, { name: 'Backend Developer', value: 'Backend Developer' }, { name: 'Fullstack Developer', value: 'Fullstack Developer' }, { name: 'UI/UX Designer', value: 'UI/UX Designer' }, { name: 'Security Researcher', value: 'Security Researcher' }, { name: 'Tester', value: 'Tester' })),
    async execute(interaction) {
        const fullName = interaction.options.getString('repo-full-name', true);
        const description = interaction.options.getString('description');
        const techStack = interaction.options.getString('tech-stack');
        const status = interaction.options.getString('status') || 'Active Development';
        const bannerUrl = interaction.options.getString('banner-url');
        const requestRole = interaction.options.getString('request-role');
        try {
            const repo = await RepositoryService.getRepositoryByFullName(fullName);
            if (!repo) {
                // Repository is not registered. Allow users to publish a public showcase preview
                // since registration is admin-only. This preview is non-interactive for persistence reasons.
                const previewComponents = [
                    new ContainerBuilder()
                        .setAccentColor(0xE5A00A)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${fullName}**`), new TextDisplayBuilder().setContent(description || 'No description provided.'), new TextDisplayBuilder().setContent(`**Status:** ${status} • **Note:** Repository is not registered. Registration is admin-only. Use /register-repo for admins or contact your server admins to register this repository.`))
                        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
                    new ActionRowBuilder().addComponents(new ButtonBuilder()
                        .setLabel('View on GitHub')
                        .setURL(`https://github.com/${fullName}`)
                        .setStyle(ButtonStyle.Link), new ButtonBuilder()
                        .setCustomId(`request_register:${fullName}`)
                        .setLabel('Request Registration')
                        .setStyle(ButtonStyle.Primary)),
                ];
                await interaction.reply(CardFactory.createReply(previewComponents));
                return;
            }
            // Update metadata
            const updatedRepo = await RepositoryService.updateMetadata(repo.id, {
                description: description || undefined,
                techStack: techStack || undefined,
                status,
                bannerUrl: bannerUrl || undefined,
            });
            const repoWithStats = await RepositoryService.getRepositoryWithStats(repo.id);
            await interaction.reply(CardFactory.createShowcaseCard({
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
            }));
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to generate showcase.',
                ephemeral: true,
            });
        }
    },
};
//# sourceMappingURL=showcase.js.map