import { SlashCommandBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, PermissionFlagsBits, } from 'discord.js';
import { RepositoryService } from '../database/repository-service.js';
import { CardFactory } from '../discord/ui/cards.js';
export const ListReposCommand = {
    data: new SlashCommandBuilder()
        .setName('list-repos')
        .setDescription('List all GitHub repositories registered in this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const guildId = interaction.guildId;
        try {
            const repos = await RepositoryService.listRepositories(guildId);
            if (repos.length === 0) {
                return interaction.reply({
                    content: 'No repositories are registered in this server.',
                    ephemeral: true,
                });
            }
            await interaction.reply({
                ...CardFactory.createReply([
                    new ContainerBuilder()
                        .setAccentColor(0x5865f2)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent('📦 **Registered Repositories**'), new TextDisplayBuilder().setContent(repos.map((r) => `• **${r.fullName}** -> <#${r.channelId}>`).join('\n')))
                        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
                ]),
                ephemeral: true,
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to fetch repositories.',
                ephemeral: true,
            });
        }
    },
};
//# sourceMappingURL=list-repos.js.map