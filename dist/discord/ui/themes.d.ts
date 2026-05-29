export declare const UI_THEMES: {
    COLORS: {
        PRIMARY: number;
        SUCCESS: number;
        ERROR: number;
        WARNING: number;
        INFO: number;
        GITHUB_DARK: number;
        PREMIUM: number;
        STAR: number;
    };
    EMOJIS: {
        REPO: string;
        COMMIT: string;
        PR: string;
        ISSUE: string;
        STAR: string;
        FORK: string;
        SUCCESS: string;
        ERROR: string;
        WARNING: string;
        AI: string;
        SHIELD: string;
        CHART: string;
        USER: string;
        BADGE: string;
    };
    SPACING: {
        SEPARATOR: string;
        NEWLINE: string;
        DOUBLE_NEWLINE: string;
    };
};
export declare class ThemeManager {
    static getStatusColor(status: string): number;
}
