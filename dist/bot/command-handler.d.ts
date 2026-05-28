import { ChatInputCommandInteraction } from 'discord.js';
export declare class CommandHandler {
    private commands;
    constructor();
    registerCommands(): Promise<void>;
    handleInteraction(interaction: ChatInputCommandInteraction): Promise<void>;
}
