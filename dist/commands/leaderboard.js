import { SlashCommandBuilder } from 'discord.js';
import { LeaderboardService } from '../database/leaderboard-service.js';
import { CardFactory } from '../discord/ui/cards.js';
export const LeaderboardCommand = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View community leaderboards')
        .addSubcommand((sub) => sub.setName('contributors').setDescription('Top contributors by reputation'))
        .addSubcommand((sub) => sub.setName('trending').setDescription('Trending repositories (last 7 days)'))
        .addSubcommand((sub) => sub.setName('stars').setDescription('Most starred projects'))
        .addSubcommand((sub) => sub.setName('active').setDescription('Most active projects'))
        .addSubcommand((sub) => sub.setName('repo-of-week').setDescription("This week's featured repository"))
        .addSubcommand((sub) => sub.setName('helpful').setDescription('Most helpful contributors'))
        .addSubcommand((sub) => sub.setName('hall-of-fame').setDescription('Hall of fame - all-time top contributors'))
        .addSubcommand((sub) => sub
        .setName('category')
        .setDescription('Ranking by category')
        .addStringOption((opt) => opt
        .setName('category')
        .setDescription('Category: AI, Cybersecurity, Minecraft, GameDev, WebDev, MobileDev')
        .setRequired(true)
        .addChoices({ name: 'AI', value: 'ai' }, { name: 'Cybersecurity', value: 'cybersecurity' }, { name: 'Minecraft', value: 'minecraft' }, { name: 'Game Development', value: 'gamedev' }, { name: 'Web Development', value: 'webdev' }, { name: 'Mobile Development', value: 'mobiledev' }))),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            switch (subcommand) {
                case 'contributors': {
                    const leaders = await LeaderboardService.getTopContributors(10);
                    if (leaders.length === 0) {
                        return interaction.reply('No contributors yet.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Top Contributors',
                        subtitle: 'Ranked by reputation and contribution impact',
                        accentColor: 0xfee75c,
                        items: leaders.map((c) => `${c.position}. **${c.name}** — ${c.value} reputation\n↳ ${c.metadata?.commits || 0} commits, ${c.metadata?.prs || 0} PRs`),
                    }));
                    break;
                }
                case 'trending': {
                    const trending = await LeaderboardService.getTrendingRepositories(10);
                    if (trending.length === 0) {
                        return interaction.reply('No trending repos yet.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Trending Repositories (7 days)',
                        subtitle: 'Fastest growing repositories by recent activity',
                        accentColor: 0xff6b6b,
                        items: trending.map((r) => `${r.position}. **${r.fullName}** — ${r.value} events`),
                    }));
                    break;
                }
                case 'stars': {
                    const starred = await LeaderboardService.getMostStarredProjects(10);
                    if (starred.length === 0) {
                        return interaction.reply('No starred repos yet.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Most Starred Projects',
                        subtitle: 'Projects with the strongest community support',
                        accentColor: 0xffd700,
                        items: starred.map((r) => `${r.position}. **${r.fullName}** — ${r.value} ⭐`),
                    }));
                    break;
                }
                case 'active': {
                    const active = await LeaderboardService.getMostActiveProjects(10);
                    if (active.length === 0) {
                        return interaction.reply('No active repos yet.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Most Active Projects',
                        subtitle: 'Repositories with the highest event volume',
                        accentColor: 0x00ff00,
                        items: active.map((r) => `${r.position}. **${r.fullName}** — ${r.value} events`),
                    }));
                    break;
                }
                case 'repo-of-week': {
                    const rotw = await LeaderboardService.getRepoOfTheWeek();
                    if (!rotw) {
                        return interaction.reply('No repo selected for this week yet.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Repo of the Week',
                        subtitle: `${rotw.fullName}\n${rotw.description || 'No description available.'}`,
                        accentColor: 0x9c27b0,
                        items: [`Engagement Score: ${rotw.value.toFixed(1)}`],
                    }));
                    break;
                }
                case 'helpful': {
                    const helpful = await LeaderboardService.getMostHelpfulContributors(10);
                    if (helpful.length === 0) {
                        return interaction.reply('No helpful contributors yet.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Most Helpful Contributors',
                        subtitle: 'Recognizing reviews, mentoring, and issue resolution',
                        accentColor: 0x00aaff,
                        items: helpful.map((c) => `${c.position}. **${c.name}** — ${c.metadata?.helpfulReviews || 0} reviews, ${c.metadata?.issuesResolved || 0} issues`),
                    }));
                    break;
                }
                case 'hall-of-fame': {
                    const fame = await LeaderboardService.getHallOfFame(15);
                    if (fame.length === 0) {
                        return interaction.reply('Hall of fame is empty.');
                    }
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: 'Hall of Fame',
                        subtitle: 'All-time community leaders',
                        accentColor: 0xff6b9d,
                        items: fame.map((c) => `${c.position}. **${c.name}** — ${c.value} reputation points`),
                    }));
                    break;
                }
                case 'category': {
                    const category = interaction.options.getString('category', true);
                    const catLeaders = await LeaderboardService.getCategoryRanking(category, 10);
                    if (catLeaders.length === 0) {
                        return interaction.reply(`No projects in the ${category.toUpperCase()} category yet.`);
                    }
                    const categoryNames = {
                        ai: '🤖 AI',
                        cybersecurity: '🔐 Cybersecurity',
                        minecraft: '⛏️ Minecraft',
                        gamedev: '🎮 Game Development',
                        webdev: '🌐 Web Development',
                        mobiledev: '📱 Mobile Development',
                    };
                    await interaction.reply(CardFactory.createLeaderboardCard({
                        title: `${categoryNames[category] || category.toUpperCase()} Projects`,
                        subtitle: 'Category rankings',
                        accentColor: 0xaa00ff,
                        items: catLeaders.map((r) => `${r.position}. **${r.fullName}**`),
                    }));
                    break;
                }
            }
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to fetch leaderboard.',
                ephemeral: true,
            });
        }
    },
};
//# sourceMappingURL=leaderboard.js.map