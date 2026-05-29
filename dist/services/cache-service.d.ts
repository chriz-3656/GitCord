export interface CacheEntry {
    cacheKey: string;
    analysisType: string;
    result: string;
    provider: string;
    expiresAt: Date;
}
export declare class AIResultCache {
    private static readonly DEFAULT_TTL_MS;
    static generateCacheKey(type: string, content: string): string;
    static get(cacheKey: string): Promise<string | null>;
    static set(cacheKey: string, analysisType: string, result: string, provider: string, ttlMs?: number): Promise<void>;
    static delete(cacheKey: string): Promise<void>;
    static clearExpired(): Promise<number>;
}
