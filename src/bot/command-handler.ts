import { REST, Routes, ChatInputCommandInteraction, Collection } from 'discord.js';
import { RegisterRepoCommand } from '../commands/register-repo.js';
import { ListReposCommand } from '../commands/list-repos.js';
import { RemoveRepoCommand } from '../commands/remove-repo.js';
import { LeaderboardCommand } from '../commands/leaderboard.js';
import { ShowcaseCommand } from '../commands/showcase.js';
import { ProfileCommand } from '../commands/profile.js';
import { GoodFirstIssuesCommand } from '../commands/good-first-issues.js';
import { NotificationSettingsCommand } from '../commands/notification-settings.js';
import pino from 'pino';

const logger = (pino as any)({
  transport: { target: 'pino-pretty' },
});

export class CommandHandler {
  private commands = new Collection<string, any>();

  constructor() {
    this.commands.set(RegisterRepoCommand.data.name, RegisterRepoCommand);
    this.commands.set(ListReposCommand.data.name, ListReposCommand);
    this.commands.set(RemoveRepoCommand.data.name, RemoveRepoCommand);
    this.commands.set(LeaderboardCommand.data.name, LeaderboardCommand);
    this.commands.set(ShowcaseCommand.data.name, ShowcaseCommand);
    this.commands.set(ProfileCommand.data.name, ProfileCommand);
    this.commands.set(GoodFirstIssuesCommand.data.name, GoodFirstIssuesCommand);
    this.commands.set(NotificationSettingsCommand.data.name, NotificationSettingsCommand);
  }

  async registerCommands() {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !clientId) {
      logger.warn('DISCORD_TOKEN or DISCORD_CLIENT_ID missing, cannot register commands');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      logger.info('Started refreshing application (/) commands.');

      const commandsData = Array.from(this.commands.values()).map((c) => c.data.toJSON());

      await rest.put(Routes.applicationCommands(clientId), {
        body: commandsData,
      });

      logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
      logger.error('Error registering commands:', error);
    }
  }

  async handleInteraction(interaction: ChatInputCommandInteraction) {
    const command = this.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing ${interaction.commandName}:`, error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
}
