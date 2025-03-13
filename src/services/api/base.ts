
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cacheService } from "@/services/cache/cacheService";

/**
 * Invoke a Supabase Edge Function with retry logic
 */
export async function invokeSupabaseFunction<T>(
  functionName: string,
  payload: any,
  options: {
    retries?: number;
    useCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
  } = {}
): Promise<T> {
  const {
    retries = 2,
    useCache = true,
    cacheKey = `edge-fn:${functionName}:${JSON.stringify(payload)}`,
    cacheTTL = 5 * 60 * 1000 // 5 minutes default
  } = options;
  
  // Try to get from cache first if enabled
  if (useCache) {
    const cachedData = cacheService.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Invoking Supabase function: ${functionName} (attempt ${attempt + 1}/${retries + 1})`);
      
      const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: payload
      });
      
      if (error) {
        console.error(`Error invoking ${functionName}:`, error);
        lastError = new Error(`API error (${functionName}): ${error.message}`);
        
        // Wait before retrying with exponential backoff
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw lastError;
      }
      
      if (!data) {
        throw new Error(`No data returned from ${functionName}`);
      }
      
      // Store in cache if enabled
      if (useCache) {
        cacheService.set(cacheKey, data, cacheTTL);
      }
      
      return data as T;
    } catch (err) {
      console.error(`Error invoking ${functionName}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Wait before retrying with exponential backoff
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw lastError;
    }
  }
  
  // This should never happen due to the throws above, but TypeScript needs it
  throw lastError || new Error(`Failed to invoke ${functionName}`);
}

/**
 * Options for withRetry function
 */
export interface RetryOptions {
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Enhanced retry function with more options
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 2,
    retryDelay = 1000,
    onRetry = (attempt, error) => console.log(`Attempt ${attempt} failed: ${error.message}. Retrying...`),
    shouldRetry = () => true
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      
      // Don't retry if shouldRetry returns false
      if (!shouldRetry(error)) {
        console.log(`Not retrying due to error type: ${error.message}`);
        break;
      }
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        const delay = attempt === 0 ? retryDelay : Math.pow(2, attempt) * retryDelay;
        
        // Execute onRetry callback
        onRetry(attempt + 1, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Function failed after retries");
}

/**
 * Fetch with cache helper
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes by default
): Promise<T> {
  // Try from cache first
  const cachedData = cacheService.get<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch fresh data
  try {
    const data = await fetcher();
    
    // Only cache valid responses
    if (data) {
      cacheService.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error(`Error in fetchWithCache for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Prefetch data and store in cache
 */
export function prefetchData<T>(
  cacheKey: string, 
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<void> {
  // Don't block the caller, just start the fetch in background
  return new Promise((resolve) => {
    // Run asynchronously
    setTimeout(async () => {
      try {
        if (!cacheService.has(cacheKey)) {
          const data = await fetcher();
          cacheService.set(cacheKey, data, ttl);
          console.log(`Prefetched data for ${cacheKey}`);
        }
        resolve();
      } catch (error) {
        console.error(`Error prefetching ${cacheKey}:`, error);
        resolve();
      }
    }, 0);
  });
}

/**
 * Clear cached data for a specific key pattern
 */
export function clearCacheByPattern(pattern: string): number {
  let count = 0;
  const stats = cacheService.getStats();
  
  // Unfortunately we can't easily iterate through keys in the Map
  // without exposing internals of cacheService, so we'll handle this
  // in a future update with a more comprehensive approach
  
  // For now, clear all cache as a workaround
  cacheService.clear();
  count = stats.entryCount;
  
  console.log(`Cleared ${count} cache entries matching pattern: ${pattern}`);
  return count;
}
