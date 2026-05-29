import { EmbedBuilder } from 'discord.js';
import { UI_THEMES } from './themes.js';

export class LayoutService {
  static createBaseEmbed(title: string, color: number = UI_THEMES.COLORS.GITHUB_DARK) {
    return new EmbedBuilder().setTitle(title).setColor(color).setTimestamp().setFooter({
      text: 'GitCord Ecosystem',
      iconURL: 'https://github.com/identicons/gitcord.png',
    });
  }

  static addHeader(embed: EmbedBuilder, text: string, icon?: string) {
    const header = icon ? `${icon} ${text}` : text;
    embed.setAuthor({ name: header });
    return embed;
  }

  static addMetaGrid(
    embed: EmbedBuilder,
    fields: { label: string; value: string | number; inline?: boolean }[],
  ) {
    fields.forEach((f) => {
      embed.addFields({ name: f.label, value: String(f.value), inline: f.inline ?? true });
    });
    return embed;
  }

  static addActivityStream(embed: EmbedBuilder, activities: string[]) {
    if (activities.length === 0) return embed;
    embed.setDescription(activities.join('\n'));
    return embed;
  }
}
