
import { useState } from "react";
import { getWithCache, invalidateCache, CACHE_EXPIRY } from "./cacheService";

/**
 * Hook for convenient data caching in components
 */
export const useCacheService = <T>(
  cacheKeyPrefix: string = "app"
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get data with caching
   */
  const fetchWithCache = async <D>(
    key: string,
    fetchFn: () => Promise<D>,
    expiryMs: number = CACHE_EXPIRY.MEDIUM
  ): Promise<D | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cacheKey = `${cacheKeyPrefix}:${key}`;
      const data = await getWithCache<D>(cacheKey, fetchFn, expiryMs);
      
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Invalidate a specific cache entry
   */
  const clearCache = async (key: string): Promise<boolean> => {
    try {
      const cacheKey = `${cacheKeyPrefix}:${key}`;
      return await invalidateCache(cacheKey);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return false;
    }
  };

  return {
    fetchWithCache,
    clearCache,
    isLoading,
    error
  };
};
