export declare class NotificationCooldownService {
    private static cooldownCache;
    private static getCacheKey;
    /**
     * Check if a user should be pinged for this event
     * Returns true if cooldown has passed or first interaction
     */
    static shouldPing(userId: string, repoId: string, eventType?: 'mention' | 'release' | 'interaction' | 'general', customCooldownMs?: number): Promise<boolean>;
    /**
     * Record that a user was pinged for this event
     */
    static recordPing(userId: string, repoId: string, eventType?: 'mention' | 'release' | 'interaction' | 'general'): Promise<void>;
    /**
     * Get time until next ping is allowed (in seconds)
     * Returns 0 if ping is allowed
     */
    static getCooldownRemaining(userId: string, repoId: string, eventType?: 'mention' | 'release' | 'interaction' | 'general', customCooldownMs?: number): Promise<number>;
    /**
     * Get user's notification preferences
     */
    static getPreferences(userId: string): Promise<{
        id: string;
        contributorId: string;
        silentMode: boolean;
        pingOnRelease: boolean;
        pingOnMention: boolean;
    } | null>;
    /**
     * Update user notification preferences
     */
    static updatePreferences(userId: string, updates: {
        silentMode?: boolean;
        pingOnRelease?: boolean;
        pingOnMention?: boolean;
    }): Promise<{
        id: string;
        contributorId: string;
        silentMode: boolean;
        pingOnRelease: boolean;
        pingOnMention: boolean;
    }>;
    /**
     * Clear cooldown for testing or admin purposes
     */
    static clearCooldown(userId: string, repoId: string, eventType?: 'mention' | 'release' | 'interaction' | 'general'): Promise<void>;
}
