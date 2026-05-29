import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { NotificationCooldownService } from '../database/notification-cooldown-service.js';
import { ContributorService } from '../database/contributor-service.js';
export const NotificationSettingsCommand = {
    data: new SlashCommandBuilder()
        .setName('notification-settings')
        .setDescription('Configure your notification preferences')
        .addSubcommand((sub) => sub.setName('view').setDescription('View your current notification settings'))
        .addSubcommand((sub) => sub
        .setName('silent-mode')
        .setDescription('Toggle silent mode (no notifications)')
        .addBooleanOption((opt) => opt.setName('enabled').setDescription('Enable or disable silent mode').setRequired(true)))
        .addSubcommand((sub) => sub
        .setName('ping-release')
        .setDescription('Toggle release notifications')
        .addBooleanOption((opt) => opt
        .setName('enabled')
        .setDescription('Enable or disable release pings')
        .setRequired(true)))
        .addSubcommand((sub) => sub
        .setName('ping-mention')
        .setDescription('Toggle mention notifications')
        .addBooleanOption((opt) => opt
        .setName('enabled')
        .setDescription('Enable or disable mention pings')
        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const discordId = interaction.user.id;
        // Ensure contributor exists
        await ContributorService.getOrCreateByDiscordId(discordId, interaction.user.username);
        switch (subcommand) {
            case 'view': {
                const prefs = await NotificationCooldownService.getPreferences(discordId);
                const embed = new EmbedBuilder()
                    .setTitle('📢 Your Notification Settings')
                    .setColor('#5865F2')
                    .addFields({
                    name: '🔇 Silent Mode',
                    value: prefs?.silentMode ? '✅ Enabled (no notifications)' : '❌ Disabled',
                    inline: true,
                }, {
                    name: '🎉 Release Notifications',
                    value: prefs?.pingOnRelease ? '✅ Enabled' : '❌ Disabled',
                    inline: true,
                }, {
                    name: '👤 Mention Notifications',
                    value: prefs?.pingOnMention ? '✅ Enabled' : '❌ Disabled',
                    inline: true,
                })
                    .setFooter({ text: 'Use subcommands to change these settings' });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
            case 'silent-mode': {
                const enabled = interaction.options.getBoolean('enabled', true);
                await NotificationCooldownService.updatePreferences(discordId, { silentMode: enabled });
                const embed = new EmbedBuilder()
                    .setTitle('🔇 Silent Mode Updated')
                    .setColor(enabled ? '#43B581' : '#F04747')
                    .setDescription(enabled
                    ? 'You will not receive any notifications until you disable silent mode.'
                    : 'You will now receive notifications as configured.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
            case 'ping-release': {
                const enabled = interaction.options.getBoolean('enabled', true);
                await NotificationCooldownService.updatePreferences(discordId, { pingOnRelease: enabled });
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Release Notifications Updated')
                    .setColor(enabled ? '#43B581' : '#F04747')
                    .setDescription(enabled
                    ? 'You will be pinged for new releases.'
                    : 'You will not be pinged for releases (silent notifications only).');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
            case 'ping-mention': {
                const enabled = interaction.options.getBoolean('enabled', true);
                await NotificationCooldownService.updatePreferences(discordId, { pingOnMention: enabled });
                const embed = new EmbedBuilder()
                    .setTitle('👤 Mention Notifications Updated')
                    .setColor(enabled ? '#43B581' : '#F04747')
                    .setDescription(enabled
                    ? 'You will be pinged when mentioned.'
                    : 'You will not be pinged when mentioned (silent notifications only).');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    },
};
//# sourceMappingURL=notification-settings.js.map