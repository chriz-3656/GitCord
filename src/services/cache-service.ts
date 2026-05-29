import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export interface CacheEntry {
  cacheKey: string;
  analysisType: string;
  result: string;
  provider: string;
  expiresAt: Date;
}

export class AIResultCache {
  private static readonly DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  static generateCacheKey(type: string, content: string): string {
    const hash = createHash('sha256').update(content).digest('hex');
    return `${type}:${hash}`;
  }

  static async get(cacheKey: string): Promise<string | null> {
    try {
      const cached = await prisma.aICache.findUnique({
        where: { cacheKey },
      });

      if (!cached) {
        return null;
      }

      if (new Date() > cached.ttl) {
        await prisma.aICache.delete({
          where: { cacheKey },
        });
        return null;
      }

      return cached.result;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  static async set(
    cacheKey: string,
    analysisType: string,
    result: string,
    provider: string,
    ttlMs: number = AIResultCache.DEFAULT_TTL_MS,
  ): Promise<void> {
    try {
      const ttl = new Date(Date.now() + ttlMs);

      await prisma.aICache.upsert({
        where: { cacheKey },
        update: {
          result,
          provider,
          ttl,
          updatedAt: new Date(),
        },
        create: {
          cacheKey,
          analysisType,
          contentHash: cacheKey.split(':')[1] || '',
          result,
          provider,
          ttl,
        },
      });
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  static async delete(cacheKey: string): Promise<void> {
    try {
      await prisma.aICache.delete({
        where: { cacheKey },
      });
    } catch (error) {
      console.error('Cache deletion error:', error);
    }
  }

  static async clearExpired(): Promise<number> {
    try {
      const result = await prisma.aICache.deleteMany({
        where: {
          ttl: {
            lt: new Date(),
          },
        },
      });
      return result.count;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
}
