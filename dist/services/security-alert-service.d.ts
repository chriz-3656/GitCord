import { EmbedBuilder } from 'discord.js';
import { SecurityIssue } from '../security/security-service.js';
export declare class SecurityAlertService {
    private static readonly REMEDIATION_LINKS;
    static createSecurityAlertEmbed(repoFullName: string, issues: SecurityIssue[], pusher: string, commitHash?: string): EmbedBuilder;
    static createSecurityReportEmbed(repoFullName: string, issues: SecurityIssue[], _pusher: string): EmbedBuilder;
    static formatSecurityAlert(repoFullName: string, issues: SecurityIssue[], pusher: string, commitHash?: string): Promise<{
        embeds: EmbedBuilder[];
        hasIssues: boolean;
    }>;
}
