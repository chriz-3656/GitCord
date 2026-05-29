import { SlashCommandBuilder } from 'discord.js';
import { ContributorService } from '../database/contributor-service.js';
import { AchievementService } from '../database/achievement-service.js';
import { CardFactory } from '../discord/ui/cards.js';
export const ProfileCommand = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your developer profile and reputation')
        .addUserOption((option) => option.setName('user').setDescription('The user to view (optional)')),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        try {
            const profile = await ContributorService.getProfileByDiscordId(targetUser.id);
            if (!profile) {
                return interaction.reply({
                    content: targetUser.id === interaction.user.id
                        ? "You don't have a profile yet. Start contributing to a registered repo!"
                        : "This user doesn't have a profile yet.",
                    ephemeral: true,
                });
            }
            // Achievements/Badges
            const badges = await AchievementService.getContributorBadges(profile.id);
            const tier = this.getReputationTier(profile.reputation);
            await interaction.reply(CardFactory.createProfileCard({
                username: profile.username,
                avatarUrl: profile.avatarUrl || targetUser.displayAvatarURL(),
                reputation: profile.reputation,
                tier,
                commits: profile.commits,
                prs: profile.prs,
                mergedPrs: profile.mergedPrs,
                issues: profile.issues,
                stars: profile.stars,
                helpfulReviews: profile.helpfulReviews,
                badges: badges.length > 0
                    ? badges.map((b) => `${AchievementService.getRarityEmoji(b.rarity)} **${b.name}** - ${b.description}`)
                    : ['No achievements yet. Keep contributing!'],
            }));
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to fetch profile.',
                ephemeral: true,
            });
        }
    },
    getReputationTier(reputation) {
        if (reputation >= 1000)
            return '🌟 Legend';
        if (reputation >= 500)
            return '⭐ Elite';
        if (reputation >= 250)
            return '🟢 Expert';
        if (reputation >= 100)
            return '🔵 Advanced';
        if (reputation >= 50)
            return '🟡 Intermediate';
        return '🔴 Beginner';
    },
};
//# sourceMappingURL=profile.js.map