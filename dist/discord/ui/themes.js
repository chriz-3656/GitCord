export const UI_THEMES = {
    COLORS: {
        PRIMARY: 0x5865f2, // Discord Blurple
        SUCCESS: 0x23a55a, // GitHub Green
        ERROR: 0xf23f42, // Red
        WARNING: 0xf0b232, // Yellow
        INFO: 0x00a8fc, // Blue
        GITHUB_DARK: 0x2b2d31, // Dashboard Zinc
        PREMIUM: 0xeb459e, // Pink
        STAR: 0xfee75c, // Gold
    },
    EMOJIS: {
        REPO: '<:repo:1234567890> ', // Placeholders to be replaced with actual or unicode
        COMMIT: '📝',
        PR: '🔀',
        ISSUE: '❗',
        STAR: '⭐',
        FORK: '🍴',
        SUCCESS: '✅',
        ERROR: '❌',
        WARNING: '⚠️',
        AI: '🤖',
        SHIELD: '🛡️',
        CHART: '📊',
        USER: '👤',
        BADGE: '🏅',
    },
    SPACING: {
        SEPARATOR: ' • ',
        NEWLINE: '\n',
        DOUBLE_NEWLINE: '\n\n',
    },
};
export class ThemeManager {
    static getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'active':
            case 'active development':
                return UI_THEMES.COLORS.SUCCESS;
            case 'beta':
            case 'beta testing':
                return UI_THEMES.COLORS.INFO;
            case 'maintenance':
            case 'maintenance mode':
                return UI_THEMES.COLORS.WARNING;
            case 'archived':
                return UI_THEMES.COLORS.GITHUB_DARK;
            default:
                return UI_THEMES.COLORS.PRIMARY;
        }
    }
}
//# sourceMappingURL=themes.js.map