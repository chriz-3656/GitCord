import { EmbedBuilder } from 'discord.js';
import { SecurityIssue } from '../security/security-service.js';
import { type ComponentsV2Reply } from '../discord/ui/cards.js';
export declare class SecurityAlertService {
    private static readonly REMEDIATION_LINKS;
    static createSecurityAlertEmbed(repoFullName: string, issues: SecurityIssue[], pusher: string, commitHash?: string): EmbedBuilder;
    static createSecurityReportEmbed(repoFullName: string, issues: SecurityIssue[], _pusher: string): EmbedBuilder;
    static createSecurityAlertCard(repoFullName: string, issues: SecurityIssue[], pusher: string, commitHash?: string): ComponentsV2Reply;
    static formatSecurityAlert(repoFullName: string, issues: SecurityIssue[], pusher: string, commitHash?: string): Promise<{
        embeds: EmbedBuilder[];
        hasIssues: boolean;
    }>;
}
