import { REST, Routes, Collection, } from 'discord.js';
import { RegisterRepoCommand } from '../commands/register-repo.js';
import pino from 'pino';
const logger = pino({
    transport: { target: 'pino-pretty' },
});
export class CommandHandler {
    commands = new Collection();
    constructor() {
        this.commands.set(RegisterRepoCommand.data.name, RegisterRepoCommand);
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
        }
        catch (error) {
            logger.error('Error registering commands:', error);
        }
    }
    async handleInteraction(interaction) {
        const command = this.commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            await command.execute(interaction);
        }
        catch (error) {
            logger.error(`Error executing ${interaction.commandName}:`, error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
}
//# sourceMappingURL=command-handler.js.map