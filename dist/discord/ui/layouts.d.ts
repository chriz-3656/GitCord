import { EmbedBuilder } from 'discord.js';
export declare class LayoutService {
    static createBaseEmbed(title: string, color?: number): EmbedBuilder;
    static addHeader(embed: EmbedBuilder, text: string, icon?: string): EmbedBuilder;
    static addMetaGrid(embed: EmbedBuilder, fields: {
        label: string;
        value: string | number;
        inline?: boolean;
    }[]): EmbedBuilder;
    static addActivityStream(embed: EmbedBuilder, activities: string[]): EmbedBuilder;
}
