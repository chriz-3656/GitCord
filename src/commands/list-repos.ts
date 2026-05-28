import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { RepositoryService } from '../database/repository-service.js';

export const ListReposCommand = {
  data: new SlashCommandBuilder()
    .setName('list-repos')
    .setDescription('List all GitHub repositories registered in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;

    try {
      const repos = await RepositoryService.listRepositories(guildId);

      if (repos.length === 0) {
        return interaction.reply({
          content: 'No repositories are registered in this server.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📦 Registered Repositories')
        .setColor(0x5865f2)
        .setDescription(
          repos.map((r) => `• **${r.fullName}** -> <#${r.channelId}>`).join('\n'),
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Failed to fetch repositories.',
        ephemeral: true,
      });
    }
  },
};
