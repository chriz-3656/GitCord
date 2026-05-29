import { SlashCommandBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, } from 'discord.js';
import { NotificationCooldownService } from '../database/notification-cooldown-service.js';
import { ContributorService } from '../database/contributor-service.js';
import { CardFactory } from '../discord/ui/cards.js';
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
                await interaction.reply({
                    ...CardFactory.createReply([
                        new ContainerBuilder()
                            .setAccentColor(0x5865f2)
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent('📢 **Your Notification Settings**'), new TextDisplayBuilder().setContent([
                            `🔇 **Silent Mode:** ${prefs?.silentMode ? '✅ Enabled (no notifications)' : '❌ Disabled'}`,
                            `🎉 **Release Notifications:** ${prefs?.pingOnRelease ? '✅ Enabled' : '❌ Disabled'}`,
                            `👤 **Mention Notifications:** ${prefs?.pingOnMention ? '✅ Enabled' : '❌ Disabled'}`,
                        ].join('\n')), new TextDisplayBuilder().setContent('Use subcommands to change these settings'))
                            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
                    ]),
                    ephemeral: true,
                });
                break;
            }
            case 'silent-mode': {
                const enabled = interaction.options.getBoolean('enabled', true);
                await NotificationCooldownService.updatePreferences(discordId, { silentMode: enabled });
                await interaction.reply({
                    ...CardFactory.createReply([
                        new ContainerBuilder()
                            .setAccentColor(enabled ? 0x43b581 : 0xf04747)
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent('🔇 **Silent Mode Updated**'), new TextDisplayBuilder().setContent(enabled
                            ? 'You will not receive any notifications until you disable silent mode.'
                            : 'You will now receive notifications as configured.'))
                            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
                    ]),
                    ephemeral: true,
                });
                break;
            }
            case 'ping-release': {
                const enabled = interaction.options.getBoolean('enabled', true);
                await NotificationCooldownService.updatePreferences(discordId, { pingOnRelease: enabled });
                await interaction.reply({
                    ...CardFactory.createReply([
                        new ContainerBuilder()
                            .setAccentColor(enabled ? 0x43b581 : 0xf04747)
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent('🎉 **Release Notifications Updated**'), new TextDisplayBuilder().setContent(enabled
                            ? 'You will be pinged for new releases.'
                            : 'You will not be pinged for releases (silent notifications only).'))
                            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
                    ]),
                    ephemeral: true,
                });
                break;
            }
            case 'ping-mention': {
                const enabled = interaction.options.getBoolean('enabled', true);
                await NotificationCooldownService.updatePreferences(discordId, { pingOnMention: enabled });
                await interaction.reply({
                    ...CardFactory.createReply([
                        new ContainerBuilder()
                            .setAccentColor(enabled ? 0x43b581 : 0xf04747)
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent('👤 **Mention Notifications Updated**'), new TextDisplayBuilder().setContent(enabled
                            ? 'You will be pinged when mentioned.'
                            : 'You will not be pinged when mentioned (silent notifications only).'))
                            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)),
                    ]),
                    ephemeral: true,
                });
                break;
            }
        }
    },
};
//# sourceMappingURL=notification-settings.js.map