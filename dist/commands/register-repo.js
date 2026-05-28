import { SlashCommandBuilder, PermissionFlagsBits, } from 'discord.js';
import { RepositoryService } from '../database/repository-service.js';
export const RegisterRepoCommand = {
    data: new SlashCommandBuilder()
        .setName('register-repo')
        .setDescription('Register a GitHub repository to this channel')
        .addStringOption((option) => option
        .setName('repo-full-name')
        .setDescription('The full name of the repository (e.g., owner/repo)')
        .setRequired(true))
        .addStringOption((option) => option
        .setName('webhook-secret')
        .setDescription('The secret configured in GitHub webhook')
        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const fullName = interaction.options.getString('repo-full-name', true);
        const secret = interaction.options.getString('webhook-secret', true);
        const guildId = interaction.guildId;
        const guildName = interaction.guild?.name || 'Unknown Guild';
        const channelId = interaction.channelId;
        try {
            await RepositoryService.registerRepository({
                guildId,
                guildName,
                fullName,
                channelId,
                webhookSecret: secret,
            });
            await interaction.reply({
                content: `✅ Successfully registered **${fullName}** to this channel!`,
                ephemeral: true,
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to register repository. Please ensure the name is correct.',
                ephemeral: true,
            });
        }
    },
};
//# sourceMappingURL=register-repo.js.map