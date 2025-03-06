import { supabase } from "./supabaseClient";

/**
 * Function to get data from API cache or fetch it if not cached
 */
export const getCachedOrFetchData = async <T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  cacheTTLMinutes: number = 60
): Promise<T> => {
  try {
    // Try to get data from cache
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + cacheTTLMinutes);
    
    const { data: cachedData, error: cacheError } = await supabase
      .rpc('get_or_create_cache', {
        p_cache_key: cacheKey,
        p_expires_at: expiresAt.toISOString(),
        p_default_data: null
      });
    
    // If we have valid cached data, return it
    if (!cacheError && cachedData !== null) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData as T;
    }
    
    // Otherwise fetch fresh data
    console.log(`Cache miss for ${cacheKey}, fetching fresh data...`);
    const freshData = await fetchFunction();
    
    // Store the fresh data in cache for future requests
    if (freshData) {
      const { error: updateError } = await supabase
        .from('api_cache')
        .upsert({
          cache_key: cacheKey,
          data: freshData as any,
          expires_at: expiresAt.toISOString(),
          metadata: { 
            fetched_at: new Date().toISOString()
          }
        }, { onConflict: 'cache_key' });
      
      if (updateError) {
        console.error(`Error updating cache for ${cacheKey}:`, updateError);
      }
    }
    
    return freshData;
  } catch (err) {
    console.error(`Error in getCachedOrFetchData for ${cacheKey}:`, err);
    throw err;
  }
};
