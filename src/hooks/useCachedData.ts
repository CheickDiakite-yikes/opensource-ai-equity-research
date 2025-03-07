
import { useState, useEffect, useCallback } from 'react';
import { fetchWithCache, clearCacheByPattern } from '@/services/api/base';
import { toast } from 'sonner';

interface CacheHookOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  defaultTTL?: number;
  showToasts?: boolean;
}

/**
 * Hook for easy data fetching with cache integration
 */
export function useCachedData(options: CacheHookOptions = {}) {
  const { 
    onError, 
    onSuccess, 
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    showToasts = true 
  } = options;
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Fetch data with automatic caching
   */
  const fetchWithCache = useCallback(async <D>(
    key: string,
    fetchFn: () => Promise<D>,
    expiryMs: number = defaultTTL
  ): Promise<D> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithCache(key, fetchFn, expiryMs);
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      if (showToasts) {
        toast.error(`Error loading data: ${error.message}`);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [defaultTTL, onError, onSuccess, showToasts]);
  
  /**
   * Clear specific cache entry
   */
  const clearCache = useCallback(async (key: string): Promise<boolean> => {
    try {
      const cleared = clearCacheByPattern(key);
      if (showToasts && cleared > 0) {
        toast.success(`Cache cleared for ${key}`);
      }
      return true;
    } catch (e) {
      console.error(`Error clearing cache for ${key}:`, e);
      return false;
    }
  }, [showToasts]);
  
  return {
    fetchWithCache,
    clearCache,
    isLoading,
    error
  };
}
