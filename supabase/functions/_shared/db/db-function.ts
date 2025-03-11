
/**
 * Function to execute database functions with caching capabilities
 */
export async function executeDBFunction<T>(
  supabase: any,
  functionName: string,
  params: Record<string, any>,
  useCache: boolean = true,
  cacheTTLMinutes: number = 60
): Promise<T | null> {
  try {
    if (useCache) {
      const cacheKey = `db_func:${functionName}:${JSON.stringify(params)}`;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + cacheTTLMinutes);
      
      const { data, error } = await supabase.rpc('get_or_create_cache', {
        p_cache_key: cacheKey,
        p_expires_at: expiresAt.toISOString(),
        p_default_data: null
      });
      
      if (error) {
        console.error(`Cache error for DB function ${functionName}:`, error);
      } else if (data !== null) {
        console.log(`Cache hit for DB function ${functionName}`);
        return data as T;
      }
    }
    
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(`Error executing DB function ${functionName}:`, error);
      return null;
    }
    
    return data as T;
  } catch (err) {
    console.error(`Error in executeDBFunction for ${functionName}:`, err);
    return null;
  }
}
