import { ButtonBuilder, ActionRowBuilder } from 'discord.js';
export declare class ButtonFactory {
    static createSocialRow(repoId: string, options?: {
        liked?: boolean;
        followed?: boolean;
    }): ActionRowBuilder<ButtonBuilder>;
    static createLinkRow(urls: {
        github?: string;
        docs?: string;
        site?: string;
    }): ActionRowBuilder<ButtonBuilder>;
}
