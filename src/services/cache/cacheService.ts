
/**
 * Enhanced cache service for storing API responses with TTL support,
 * memory optimization, and automatic background cleanup.
 * Optimized for mobile performance.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
  lastAccessed?: number;
  size?: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  // Mobile optimization: smaller memory limit for mobile devices
  private memoryLimit: number = typeof window !== 'undefined' && 
    window.matchMedia('(max-width: 768px)').matches ? 
    25 * 1024 * 1024 : // 25MB for mobile 
    50 * 1024 * 1024;  // 50MB for desktop
  
  private currentMemoryUsage: number = 0;
  private cleanupInterval: number | null = null;
  
  // Default TTL is 5 minutes, shorter on mobile
  private defaultTTL = typeof window !== 'undefined' && 
    window.matchMedia('(max-width: 768px)').matches ? 
    3 * 60 * 1000 : // 3 minutes for mobile
    5 * 60 * 1000;  // 5 minutes for desktop

  private constructor() {
    this.startPeriodicCleanup();
    this.registerDeviceListeners();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Register listeners for device-specific events
   */
  private registerDeviceListeners(): void {
    if (typeof window === 'undefined') return;
    
    // Clear cache when device goes offline to save memory
    window.addEventListener('offline', () => {
      console.log('Device went offline, clearing non-essential cache items');
      this.pruneCache(0.5); // Clear 50% of cache
    });
    
    // Listen for low memory conditions on mobile devices
    if ('memory' in navigator) {
      // @ts-ignore - deviceMemory exists but might not be in all TypeScript definitions
      const lowMemoryThreshold = (navigator.deviceMemory || 4) * 0.25; // GB
      
      setInterval(() => {
        // @ts-ignore - memory exists but might not be in all TypeScript definitions
        const usedJSHeapSize = performance?.memory?.usedJSHeapSize;
        // @ts-ignore - memory exists but might not be in all TypeScript definitions
        const jsHeapSizeLimit = performance?.memory?.jsHeapSizeLimit;
        
        if (usedJSHeapSize && jsHeapSizeLimit) {
          const usedRatio = usedJSHeapSize / jsHeapSizeLimit;
          if (usedRatio > 0.8) {
            console.log('High memory usage detected, pruning cache');
            this.pruneCache(0.7); // Clear 70% of cache on high memory pressure
          }
        }
      }, 30000); // Check every 30 seconds
    }
    
    // Listen for visibility changes to optimize cache on background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.pruneCache(0.3); // Clear 30% on tab hidden
      }
    });
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
    
    // Estimate size of the data
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      // Subtract old data size first
      this.currentMemoryUsage -= oldEntry.size || this.estimateSize(oldEntry.data);
    }
    
    const estimatedSize = this.estimateSize(data);
    this.currentMemoryUsage += estimatedSize;
    
    // Store the data
    this.cache.set(key, { 
      data, 
      expiry: expiryTime,
      lastAccessed: Date.now(),
      size: estimatedSize
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
      this.delete(key);
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
      this.delete(key);
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
      this.currentMemoryUsage -= entry.size || this.estimateSize(entry.data);
      this.cache.delete(key);
    }
  }

  /**
   * Clear all expired entries
   */
  public clearExpired(): void {
    const now = Date.now();
    let freedMemory = 0;
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        freedMemory += entry.size || this.estimateSize(entry.data);
        this.currentMemoryUsage -= entry.size || this.estimateSize(entry.data);
        this.cache.delete(key);
      }
    });
    
    if (freedMemory > 0 && import.meta.env.DEV) {
      console.log(`Cache cleanup: freed ${Math.round(freedMemory / 1024)}KB of memory`);
    }
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
      size: entry.size || this.estimateSize(entry.data),
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
    isMobile: boolean;
  } {
    let oldestTime = Date.now();
    let newestTime = 0;
    
    this.cache.forEach(entry => {
      const accessTime = entry.lastAccessed || entry.expiry;
      if (accessTime < oldestTime) oldestTime = accessTime;
      if (accessTime > newestTime) newestTime = accessTime;
    });
    
    // Detect if on mobile
    const isMobile = typeof window !== 'undefined' && 
      window.matchMedia('(max-width: 768px)').matches;
    
    return {
      entryCount: this.cache.size,
      memoryUsage: this.currentMemoryUsage,
      memoryLimit: this.memoryLimit,
      oldestEntry: this.cache.size ? new Date(oldestTime) : null,
      newestEntry: this.cache.size ? new Date(newestTime) : null,
      isMobile
    };
  }
  
  /**
   * Start periodic cleanup of expired entries
   */
  private startPeriodicCleanup(intervalMs: number = 60000): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
    }
    
    // More frequent cleanup on mobile devices
    const mobileAdjustedInterval = typeof window !== 'undefined' && 
      window.matchMedia('(max-width: 768px)').matches ? 
      intervalMs / 2 : intervalMs;
    
    this.cleanupInterval = setInterval(() => {
      this.clearExpired();
      
      // On mobile, be more aggressive with cleanup
      if (typeof window !== 'undefined' && 
          window.matchMedia('(max-width: 768px)').matches) {
        if (this.currentMemoryUsage > this.memoryLimit * 0.7) {
          this.pruneCache(0.3); // Remove 30% on mobile if memory usage is high
        }
      }
    }, mobileAdjustedInterval) as unknown as number;
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
    
    // On mobile, be more aggressive about clearing the cache
    const targetThreshold = typeof window !== 'undefined' && 
      window.matchMedia('(max-width: 768px)').matches ? 
      0.7 : 0.8; // 70% of limit on mobile, 80% on desktop
    
    // Remove oldest entries until we're under the limit
    let freedBytes = 0;
    for (const [key, entry] of entries) {
      if (this.currentMemoryUsage <= this.memoryLimit * targetThreshold) {
        break;
      }
      
      const entrySize = entry.size || this.estimateSize(entry.data);
      this.cache.delete(key);
      this.currentMemoryUsage -= entrySize;
      freedBytes += entrySize;
      
      if (import.meta.env.DEV) {
        console.log(`Cache: removed '${key}' (${Math.round(entrySize/1024)}KB) due to memory limits`);
      }
    }
    
    if (freedBytes > 0 && import.meta.env.DEV) {
      console.log(`Cache memory limit enforced: freed ${Math.round(freedBytes/1024)}KB, current usage: ${Math.round(this.currentMemoryUsage/1024)}KB`);
    }
  }
  
  /**
   * Prune a percentage of the cache (least recently used items)
   */
  private pruneCache(percentage: number): void {
    if (percentage <= 0 || percentage > 1) {
      console.error('Invalid pruning percentage, must be between 0-1');
      return;
    }
    
    // Get all cache entries in order of last accessed
    const entries: [string, CacheEntry<any>][] = [...this.cache.entries()];
    if (entries.length === 0) return;
    
    entries.sort((a, b) => {
      const timeA = a[1].lastAccessed || a[1].expiry;
      const timeB = b[1].lastAccessed || b[1].expiry;
      return timeA - timeB; // Oldest first
    });
    
    // Calculate how many entries to remove
    const removeCount = Math.ceil(entries.length * percentage);
    if (removeCount === 0) return;
    
    let freedBytes = 0;
    let removedCount = 0;
    
    // Remove the oldest entries
    for (let i = 0; i < removeCount; i++) {
      const [key, entry] = entries[i];
      const entrySize = entry.size || this.estimateSize(entry.data);
      
      this.cache.delete(key);
      this.currentMemoryUsage -= entrySize;
      freedBytes += entrySize;
      removedCount++;
    }
    
    if (import.meta.env.DEV && freedBytes > 0) {
      console.log(`Cache pruned ${Math.round(percentage * 100)}%: removed ${removedCount} entries, freed ${Math.round(freedBytes/1024)}KB`);
    }
  }
  
  /**
   * Roughly estimate the size of data in memory (in bytes)
   */
  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 0;
    
    // Use different estimation strategies based on type
    if (typeof data === 'string') {
      return data.length * 2; // Estimate 2 bytes per character
    }
    
    if (typeof data === 'number') {
      return 8; // Assume a 64-bit float
    }
    
    if (typeof data === 'boolean') {
      return 4; // Assume 4 bytes
    }
    
    if (Array.isArray(data)) {
      // Sample the first few items to estimate average size
      const sampleSize = Math.min(data.length, 10);
      if (sampleSize === 0) return 0;
      
      let sampleTotal = 0;
      for (let i = 0; i < sampleSize; i++) {
        sampleTotal += this.estimateSize(data[i]);
      }
      
      return (sampleTotal / sampleSize) * data.length;
    }
    
    if (data instanceof Date) {
      return 8; // 64-bit timestamp
    }
    
    if (typeof data === 'object') {
      try {
        const json = JSON.stringify(data);
        return json.length * 2;
      } catch (e) {
        // For non-serializable objects, use a rough estimate based on key count
        const keys = Object.keys(data);
        return keys.length * 50; // Rough estimate - 50 bytes per property
      }
    }
    
    // Fallback for any other type
    return 8;
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
