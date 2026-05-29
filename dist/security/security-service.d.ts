export declare enum SecuritySeverity {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export interface SecurityIssue {
    type: string;
    severity: SecuritySeverity;
    description: string;
    remediation: string;
    details?: string;
}
export declare class SecurityService {
    private static readonly SECRET_PATTERNS;
    private static readonly DANGEROUS_FILES;
    static detectSecurityIssues(content: string, commits?: any[], changedFiles?: string[]): SecurityIssue[];
    static isSuspiciousActivity(event: any, eventType: string): SecurityIssue | null;
    static getSeverityColor(severity: SecuritySeverity): number;
    static getSeverityBadge(severity: SecuritySeverity): string;
}
