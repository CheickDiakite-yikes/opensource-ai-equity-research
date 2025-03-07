
import { supabase } from "@/integrations/supabase/client";

// Cache expiration times
export const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 1 week
};

/**
 * Get data from cache or fetch and cache it
 */
export const getWithCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  expiryMs: number = CACHE_EXPIRY.MEDIUM
): Promise<T> => {
  try {
    // Check if we have cached data
    const expiresAt = new Date(Date.now() + expiryMs).toISOString();
    
    const { data: cacheData, error } = await supabase
      .from('api_cache')
      .select('data')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    // Return cached data if available
    if (!error && cacheData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cacheData.data as T;
    }
    
    // Fetch fresh data
    console.log(`Cache miss for key: ${cacheKey}, fetching fresh data`);
    const freshData = await fetchFn();
    
    // Store in cache
    if (freshData) {
      const { error: insertError } = await supabase
        .from('api_cache')
        .upsert({
          cache_key: cacheKey,
          data: freshData as any,
          expires_at: expiresAt,
          metadata: { 
            cached_at: new Date().toISOString(),
            type: typeof freshData
          }
        }, { 
          onConflict: 'cache_key'
        });
      
      if (insertError) {
        console.error(`Error caching data for key ${cacheKey}:`, insertError);
      }
    }
    
    return freshData;
  } catch (err) {
    console.error(`Error in getWithCache for key ${cacheKey}:`, err);
    throw err;
  }
};

/**
 * Invalidate a specific cache entry
 */
export const invalidateCache = async (cacheKey: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('api_cache')
      .delete()
      .eq('cache_key', cacheKey);
    
    if (error) {
      console.error(`Error invalidating cache for key ${cacheKey}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Error in invalidateCache for key ${cacheKey}:`, err);
    return false;
  }
};

/**
 * Invalidate all cache entries with a specific prefix
 */
export const invalidateCacheByPrefix = async (keyPrefix: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('api_cache')
      .delete()
      .like('cache_key', `${keyPrefix}%`);
    
    if (error) {
      console.error(`Error invalidating cache with prefix ${keyPrefix}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Error in invalidateCacheByPrefix for prefix ${keyPrefix}:`, err);
    return false;
  }
};
