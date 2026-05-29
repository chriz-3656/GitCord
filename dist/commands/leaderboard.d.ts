import { ChatInputCommandInteraction } from 'discord.js';
export declare const LeaderboardCommand: {
    data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
};
