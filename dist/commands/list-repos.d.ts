import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
export declare const ListReposCommand: {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
};
