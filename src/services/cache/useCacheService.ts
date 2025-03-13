
import { useState, useCallback } from 'react';

/**
 * Cache expiration times (in milliseconds)
 */
const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Cache service for storing and retrieving data with TTL
 */
export const useCacheService = () => {
  const [cacheStore] = useState<Map<string, { data: any; expires: number }>>(new Map());

  /**
   * Set data in cache with an expiration time
   */
  const setCache = useCallback(async <T,>(
    key: string,
    data: T,
    expirationTime: number = CACHE_EXPIRATION.MEDIUM
  ): Promise<void> => {
    if (!key || data === undefined) return;

    const expires = Date.now() + expirationTime;
    cacheStore.set(key, { data, expires });
    
    // Also store in localStorage for persistence across page refreshes
    try {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({ data, expires })
      );
    } catch (error) {
      console.warn('Failed to store cache in localStorage:', error);
    }
  }, [cacheStore]);

  /**
   * Get data from cache, returns null if expired or not found
   */
  const getCache = useCallback(async <T,>(key: string): Promise<T | null> => {
    // First check in-memory cache
    const cached = cacheStore.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    
    // If not in memory, try localStorage
    try {
      const storedCache = localStorage.getItem(`cache_${key}`);
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache);
        
        if (parsedCache.expires > Date.now()) {
          // Restore to in-memory cache and return
          cacheStore.set(key, parsedCache);
          return parsedCache.data as T;
        } else {
          // Clean up expired cache
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cache from localStorage:', error);
    }
    
    return null;
  }, [cacheStore]);

  /**
   * Clear a specific cache entry
   */
  const clearCache = useCallback((key: string): void => {
    cacheStore.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error);
    }
  }, [cacheStore]);

  /**
   * Clear all cache entries
   */
  const clearAllCache = useCallback((): void => {
    cacheStore.clear();
    
    try {
      // Only clear our cache keys
      Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all cache from localStorage:', error);
    }
  }, [cacheStore]);

  return {
    setCache,
    getCache,
    clearCache,
    clearAllCache,
    CACHE_EXPIRATION
  };
};
