import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
export class ButtonFactory {
    static createSocialRow(repoId, options = {}) {
        const likeBtn = new ButtonBuilder()
            .setCustomId(`like_${repoId}`)
            .setLabel(options.liked ? 'Liked' : 'Like')
            .setEmoji('❤️')
            .setStyle(options.liked ? ButtonStyle.Primary : ButtonStyle.Secondary);
        const followBtn = new ButtonBuilder()
            .setCustomId(`follow_${repoId}`)
            .setLabel(options.followed ? 'Following' : 'Follow')
            .setEmoji('🔔')
            .setStyle(options.followed ? ButtonStyle.Success : ButtonStyle.Secondary);
        const interestBtn = new ButtonBuilder()
            .setCustomId(`interest_${repoId}`)
            .setLabel('Interested')
            .setEmoji('🤝')
            .setStyle(ButtonStyle.Secondary);
        return new ActionRowBuilder().addComponents(likeBtn, followBtn, interestBtn);
    }
    static createLinkRow(urls) {
        const row = new ActionRowBuilder();
        if (urls.github) {
            row.addComponents(new ButtonBuilder().setLabel('GitHub').setURL(urls.github).setStyle(ButtonStyle.Link));
        }
        if (urls.docs) {
            row.addComponents(new ButtonBuilder().setLabel('Documentation').setURL(urls.docs).setStyle(ButtonStyle.Link));
        }
        if (urls.site) {
            row.addComponents(new ButtonBuilder().setLabel('Website').setURL(urls.site).setStyle(ButtonStyle.Link));
        }
        return row;
    }
}
//# sourceMappingURL=components.js.map