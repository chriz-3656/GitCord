import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { RepositoryService } from '../database/repository-service.js';
export const RemoveRepoCommand = {
    data: new SlashCommandBuilder()
        .setName('remove-repo')
        .setDescription('Unregister a GitHub repository from this server')
        .addStringOption((option) => option
        .setName('repo-full-name')
        .setDescription('The full name of the repository (e.g., owner/repo)')
        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const fullName = interaction.options.getString('repo-full-name', true);
        const guildId = interaction.guildId;
        try {
            await RepositoryService.removeRepository(guildId, fullName);
            await interaction.reply({
                content: `✅ Successfully removed **${fullName}** from GitCord.`,
                ephemeral: true,
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to remove repository. Ensure it was registered.',
                ephemeral: true,
            });
        }
    },
};
//# sourceMappingURL=remove-repo.js.map