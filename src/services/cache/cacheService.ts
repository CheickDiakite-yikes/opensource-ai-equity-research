
/**
 * Enhanced cache service for storing API responses with TTL support,
 * memory optimization, and automatic background cleanup
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
  lastAccessed?: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private memoryLimit: number = 50 * 1024 * 1024; // 50MB default memory limit
  private currentMemoryUsage: number = 0;
  private cleanupInterval: number | null = null;
  
  // Default TTL is 5 minutes
  private defaultTTL = 5 * 60 * 1000;

  private constructor() {
    // Start background cleanup
    this.startPeriodicCleanup();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set cache memory limit in bytes
   */
  public setMemoryLimit(limitInBytes: number): void {
    this.memoryLimit = limitInBytes;
    this.enforceMemoryLimit();
  }

  /**
   * Set a cache entry with optional TTL
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    const expiryTime = Date.now() + (ttl || this.defaultTTL);
    
    // Estimate size of the data (very roughly)
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      // Subtract old data size first
      this.currentMemoryUsage -= this.estimateSize(oldEntry.data);
    }
    
    const estimatedSize = this.estimateSize(data);
    this.currentMemoryUsage += estimatedSize;
    
    // Store the data
    this.cache.set(key, { 
      data, 
      expiry: expiryTime,
      lastAccessed: Date.now()
    });
    
    // Log cache operations in development
    if (import.meta.env.DEV) {
      const ttlSecs = Math.round((ttl || this.defaultTTL) / 1000);
      console.log(`Cache: stored '${key}' (${Math.round(estimatedSize / 1024)}KB, expires in ${ttlSecs}s)`);
    }
    
    // Enforce memory limits
    this.enforceMemoryLimit();
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
    
    // Update last accessed time
    entry.lastAccessed = Date.now();
    
    if (import.meta.env.DEV) {
      console.log(`Cache: hit for '${key}'`);
    }
    
    return entry.data as T;
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check for expiry
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a specific cache entry
   */
  public delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentMemoryUsage -= this.estimateSize(entry.data);
      this.cache.delete(key);
    }
  }

  /**
   * Clear all expired entries
   */
  public clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        this.currentMemoryUsage -= this.estimateSize(entry.data);
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.currentMemoryUsage = 0;
  }
  
  /**
   * Get cache entry metadata without accessing the data
   */
  public getMetadata(key: string): { size: number, expiry: Date } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    return {
      size: this.estimateSize(entry.data),
      expiry: new Date(entry.expiry)
    };
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): { 
    entryCount: number; 
    memoryUsage: number; 
    memoryLimit: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    let oldestTime = Date.now();
    let newestTime = 0;
    
    this.cache.forEach(entry => {
      const accessTime = entry.lastAccessed || entry.expiry;
      if (accessTime < oldestTime) oldestTime = accessTime;
      if (accessTime > newestTime) newestTime = accessTime;
    });
    
    return {
      entryCount: this.cache.size,
      memoryUsage: this.currentMemoryUsage,
      memoryLimit: this.memoryLimit,
      oldestEntry: this.cache.size ? new Date(oldestTime) : null,
      newestEntry: this.cache.size ? new Date(newestTime) : null
    };
  }
  
  /**
   * Start periodic cleanup of expired entries
   */
  private startPeriodicCleanup(intervalMs: number = 60000): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.clearExpired();
    }, intervalMs) as unknown as number;
  }
  
  /**
   * Stop periodic cleanup
   */
  public stopPeriodicCleanup(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Enforce memory limits by removing least recently used items
   */
  private enforceMemoryLimit(): void {
    if (this.currentMemoryUsage <= this.memoryLimit) {
      return;
    }
    
    // Create a sorted array of entries by last accessed time
    const entries: [string, CacheEntry<any>][] = [...this.cache.entries()];
    entries.sort((a, b) => {
      const timeA = a[1].lastAccessed || a[1].expiry;
      const timeB = b[1].lastAccessed || b[1].expiry;
      return timeA - timeB; // Oldest first
    });
    
    // Remove oldest entries until we're under the limit
    for (const [key, entry] of entries) {
      if (this.currentMemoryUsage <= this.memoryLimit * 0.8) { // Clear until 80% of limit
        break;
      }
      
      const entrySize = this.estimateSize(entry.data);
      this.cache.delete(key);
      this.currentMemoryUsage -= entrySize;
      
      if (import.meta.env.DEV) {
        console.log(`Cache: removed '${key}' (${Math.round(entrySize/1024)}KB) due to memory limits`);
      }
    }
  }
  
  /**
   * Roughly estimate the size of data in memory (in bytes)
   */
  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 0;
    
    // Use JSON.stringify for object size estimation
    // This is not perfect but it's a reasonable approximation
    try {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      return str.length * 2; // Rough estimate: 2 bytes per character
    } catch (e) {
      // Fallback to a very rough estimate for non-serializable objects
      return 1024; // Assume 1KB for complex objects
    }
  }
}

export const cacheService = CacheService.getInstance();

/**
 * Hook for integrating cache service with React components
 */
export const useCacheService = () => {
  return {
    get: <T>(key: string): T | null => cacheService.get<T>(key),
    set: <T>(key: string, data: T, ttl?: number): void => cacheService.set<T>(key, data, ttl),
    delete: (key: string): void => cacheService.delete(key),
    clear: (): void => cacheService.clear(),
    has: (key: string): boolean => cacheService.has(key),
    getStats: () => cacheService.getStats()
  };
};
