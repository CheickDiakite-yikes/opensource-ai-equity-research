
/**
 * Cache service for storing API responses with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  // Default TTL is 5 minutes
  private defaultTTL = 5 * 60 * 1000;

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set a cache entry with optional TTL
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    const expiryTime = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry: expiryTime });
    
    // Log cache operations in development
    if (import.meta.env.DEV) {
      console.log(`Cache: stored '${key}' (expires in ${Math.round((ttl || this.defaultTTL) / 1000)}s)`);
    }
  }

  /**
   * Get a cache entry if it exists and is not expired
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if the entry is expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      if (import.meta.env.DEV) {
        console.log(`Cache: entry '${key}' expired`);
      }
      return null;
    }
    
    if (import.meta.env.DEV) {
      console.log(`Cache: hit for '${key}'`);
    }
    
    return entry.data as T;
  }

  /**
   * Delete a specific cache entry
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all expired entries
   */
  public clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const cacheService = CacheService.getInstance();
