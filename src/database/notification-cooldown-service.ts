import { prisma } from './prisma.js';

const DEFAULT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

interface CooldownRecord {
  userId: string;
  repoId: string;
  lastPingAt: Date;
  eventType: 'mention' | 'release' | 'interaction' | 'general';
}

export class NotificationCooldownService {
  private static cooldownCache = new Map<string, CooldownRecord>();

  private static getCacheKey(userId: string, repoId: string, eventType: string): string {
    return `${userId}:${repoId}:${eventType}`;
  }

  /**
   * Check if a user should be pinged for this event
   * Returns true if cooldown has passed or first interaction
   */
  static async shouldPing(
    userId: string,
    repoId: string,
    eventType: 'mention' | 'release' | 'interaction' | 'general' = 'general',
    customCooldownMs?: number,
  ): Promise<boolean> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { contributorId: userId },
    });

    // Respect silent mode preference
    if (prefs?.silentMode) return false;

    // Check event-specific preferences
    if (eventType === 'release' && !prefs?.pingOnRelease) return false;
    if (eventType === 'mention' && !prefs?.pingOnMention) return false;

    const cacheKey = this.getCacheKey(userId, repoId, eventType);
    const cached = this.cooldownCache.get(cacheKey);
    const cooldownMs = customCooldownMs ?? DEFAULT_COOLDOWN_MS;
    const now = new Date();

    if (cached && now.getTime() - cached.lastPingAt.getTime() < cooldownMs) {
      return false;
    }

    return true;
  }

  /**
   * Record that a user was pinged for this event
   */
  static async recordPing(
    userId: string,
    repoId: string,
    eventType: 'mention' | 'release' | 'interaction' | 'general' = 'general',
  ): Promise<void> {
    const cacheKey = this.getCacheKey(userId, repoId, eventType);
    const now = new Date();

    this.cooldownCache.set(cacheKey, {
      userId,
      repoId,
      lastPingAt: now,
      eventType,
    });

    // Persist to cache (you could use Redis in future)
    // For now, in-memory cache suffices for single instance
  }

  /**
   * Get time until next ping is allowed (in seconds)
   * Returns 0 if ping is allowed
   */
  static async getCooldownRemaining(
    userId: string,
    repoId: string,
    eventType: 'mention' | 'release' | 'interaction' | 'general' = 'general',
    customCooldownMs?: number,
  ): Promise<number> {
    const cacheKey = this.getCacheKey(userId, repoId, eventType);
    const cached = this.cooldownCache.get(cacheKey);
    const cooldownMs = customCooldownMs ?? DEFAULT_COOLDOWN_MS;

    if (!cached) return 0;

    const elapsed = new Date().getTime() - cached.lastPingAt.getTime();
    const remaining = cooldownMs - elapsed;

    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
  }

  /**
   * Get user's notification preferences
   */
  static async getPreferences(userId: string) {
    return prisma.notificationPreference.findUnique({
      where: { contributorId: userId },
    });
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    updates: { silentMode?: boolean; pingOnRelease?: boolean; pingOnMention?: boolean },
  ) {
    return prisma.notificationPreference.upsert({
      where: { contributorId: userId },
      create: {
        contributorId: userId,
        ...updates,
      },
      update: updates,
    });
  }

  /**
   * Clear cooldown for testing or admin purposes
   */
  static async clearCooldown(
    userId: string,
    repoId: string,
    eventType?: 'mention' | 'release' | 'interaction' | 'general',
  ): Promise<void> {
    if (eventType) {
      const cacheKey = this.getCacheKey(userId, repoId, eventType);
      this.cooldownCache.delete(cacheKey);
    } else {
      // Clear all for this user/repo combination
      const prefix = `${userId}:${repoId}:`;
      for (const key of this.cooldownCache.keys()) {
        if (key.startsWith(prefix)) {
          this.cooldownCache.delete(key);
        }
      }
    }
  }
}
