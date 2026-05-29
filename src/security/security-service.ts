export enum SecuritySeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface SecurityIssue {
  type: string;
  severity: SecuritySeverity;
  description: string;
  remediation: string;
  details?: string;
}

export class SecurityService {
  private static readonly SECRET_PATTERNS = [
    {
      name: 'Exposed .env file',
      regex: /\.env/i,
      severity: SecuritySeverity.CRITICAL,
      remediation:
        'Never commit .env files. Add .env to .gitignore and rotate any exposed secrets.',
    },
    {
      name: 'AWS Access Key',
      regex: /AKIA[0-9A-Z]{16}/,
      severity: SecuritySeverity.CRITICAL,
      remediation:
        'Revoke this key immediately in AWS console. This key may have been compromised.',
    },
    {
      name: 'Private Key File',
      regex: /-----BEGIN (RSA|EC|PGP) PRIVATE KEY-----/,
      severity: SecuritySeverity.CRITICAL,
      remediation: 'Remove this key immediately. Generate new keys and invalidate the exposed one.',
    },
    {
      name: 'Generic API Key',
      regex: /api[_-]?key['":\s=]+[a-zA-Z0-9]{20,}/i,
      severity: SecuritySeverity.HIGH,
      remediation: 'Rotate this API key and review access logs for unauthorized usage.',
    },
    {
      name: 'Slack Token',
      regex:
        /(xoxb|xoxp|xoxa|xox0|xox1|xox2|xox3|xox4|xox5|xox6|xox7|xox8|xox9|xoxr)-[a-zA-Z0-9-]{150,}/,
      severity: SecuritySeverity.CRITICAL,
      remediation: 'Revoke this token immediately in Slack workspace settings.',
    },
    {
      name: 'GitHub Token',
      regex: /ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}/,
      severity: SecuritySeverity.CRITICAL,
      remediation: 'Delete this token immediately from GitHub settings and regenerate if needed.',
    },
    {
      name: 'Database Connection String',
      regex: /(mongodb|mysql|postgresql|redis)[:/?]*[a-zA-Z0-9-_]*:[a-zA-Z0-9-_]*@/i,
      severity: SecuritySeverity.CRITICAL,
      remediation: 'Change database credentials immediately and use environment variables instead.',
    },
    {
      name: 'Password in Plain Text',
      regex: /password\s*[:=]\s*['"]?[^'";\s]+['"]?/i,
      severity: SecuritySeverity.HIGH,
      remediation: 'Remove passwords from code and use secure credential management.',
    },
  ];

  private static readonly DANGEROUS_FILES = [
    '.htaccess',
    'web.config',
    'web.xml',
    '.env',
    '.env.local',
    '.env.production',
    'secrets.json',
    'config.yml',
    'config.yaml',
    'package-lock.json',
  ];

  static detectSecurityIssues(
    content: string,
    commits?: any[],
    changedFiles?: string[],
  ): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for exposed secrets in content
    for (const pattern of this.SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        issues.push({
          type: pattern.name,
          severity: pattern.severity,
          description: `${pattern.name} detected in commit content`,
          remediation: pattern.remediation,
        });
      }
    }

    // Check for dangerous file changes
    if (changedFiles) {
      for (const file of changedFiles) {
        if (this.DANGEROUS_FILES.some((df) => file.endsWith(df))) {
          issues.push({
            type: 'Dangerous File Modified',
            severity: SecuritySeverity.HIGH,
            description: `Critical configuration file modified: ${file}`,
            remediation:
              'Verify this change is intentional and review all modifications to this file.',
            details: file,
          });
        }
      }
    }

    // Check for suspicious commit patterns
    if (commits) {
      for (const commit of commits) {
        const commitMessage = commit.message.toLowerCase();

        // Mass deletion detection
        if ((commit.added?.length || 0) < 5 && (commit.removed?.length || 0) > 20) {
          issues.push({
            type: 'Mass File Deletion',
            severity: SecuritySeverity.MEDIUM,
            description: `Commit ${commit.id.substring(0, 7)} deleted many files (${commit.removed?.length || 0})`,
            remediation:
              'Verify deletions are intentional and no important files were removed by accident.',
            details: commit.message,
          });
        }

        // Suspicious commit message patterns
        if (/delete|drop|truncate|rm -rf|wipe|nuke/i.test(commitMessage)) {
          issues.push({
            type: 'Suspicious Commit Message',
            severity: SecuritySeverity.LOW,
            description: `Potentially destructive action mentioned in commit: "${commit.message}"`,
            remediation: 'Review commit content to ensure changes are legitimate.',
          });
        }
      }
    }

    // Remove duplicates based on type
    const uniqueIssues: SecurityIssue[] = [];
    const seenTypes = new Set<string>();
    for (const issue of issues) {
      if (!seenTypes.has(issue.type)) {
        uniqueIssues.push(issue);
        seenTypes.add(issue.type);
      }
    }

    return uniqueIssues;
  }

  static isSuspiciousActivity(event: any, eventType: string): SecurityIssue | null {
    if (eventType === 'push') {
      if (event.forced) {
        return {
          type: 'Force Push Detected',
          severity: SecuritySeverity.MEDIUM,
          description: 'A force push was performed on this branch',
          remediation:
            'Review recent commits to ensure no important changes were overwritten. Consider protecting this branch.',
        };
      }
      if (event.deleted) {
        return {
          type: 'Branch Deleted',
          severity: SecuritySeverity.MEDIUM,
          description: 'A branch was deleted',
          remediation: 'Verify this deletion was intentional. Consider branch protection rules.',
        };
      }
    }
    return null;
  }

  static getSeverityColor(severity: SecuritySeverity): number {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return 0xff0000; // Red
      case SecuritySeverity.HIGH:
        return 0xff9500; // Orange
      case SecuritySeverity.MEDIUM:
        return 0xffff00; // Yellow
      case SecuritySeverity.LOW:
        return 0x0099ff; // Blue
      default:
        return 0x808080; // Gray
    }
  }

  static getSeverityBadge(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
        return '🔴';
      case SecuritySeverity.HIGH:
        return '🟠';
      case SecuritySeverity.MEDIUM:
        return '🟡';
      case SecuritySeverity.LOW:
        return '🔵';
      default:
        return '⚪';
    }
  }
}
