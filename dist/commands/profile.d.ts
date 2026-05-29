import { ChatInputCommandInteraction } from 'discord.js';
export declare const ProfileCommand: {
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<import("discord.js").InteractionResponse<boolean> | undefined>;
    getReputationTier(reputation: number): string;
};
