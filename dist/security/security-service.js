import { EmbedBuilder } from 'discord.js';
export class SecurityService {
    static SECRET_PATTERNS = [
        { name: '.env file', regex: /\.env/i },
        { name: 'Generic API Key', regex: /api[_-]?key|secret[_-]?key/i },
        { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
        { name: 'Private Key', regex: /-----BEGIN (RSA|EC|PGP) PRIVATE KEY-----/ },
    ];
    static scanPayload(content) {
        const alerts = [];
        for (const pattern of this.SECRET_PATTERNS) {
            if (pattern.regex.test(content)) {
                alerts.push(pattern.name);
            }
        }
        return alerts;
    }
    static createSecurityAlertEmbed(repoFullName, alerts, pusher) {
        return new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('⚠ SECURITY ALERT')
            .setDescription(`Potential security risk detected in a recent push to **${repoFullName}**`)
            .addFields({ name: 'Detected Issues', value: alerts.map((a) => `• ${a}`).join('\n') }, { name: 'Pushed By', value: pusher, inline: true })
            .setTimestamp()
            .setFooter({ text: 'GitCord Security Monitor' });
    }
    static isSuspiciousActivity(event, eventType) {
        if (eventType === 'push') {
            if (event.forced)
                return 'Force push detected';
            if (event.deleted)
                return 'Branch deletion detected';
        }
        return null;
    }
}
//# sourceMappingURL=security-service.js.map