import { EmbedBuilder } from 'discord.js';
export declare class SecurityService {
    private static readonly SECRET_PATTERNS;
    static scanPayload(content: string): string[];
    static createSecurityAlertEmbed(repoFullName: string, alerts: string[], pusher: string): EmbedBuilder;
    static isSuspiciousActivity(event: any, eventType: string): string | null;
}
