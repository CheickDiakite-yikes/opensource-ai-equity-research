
/**
 * Utility functions for stored procedures
 */

/**
 * Helper function to create or execute a stored procedure
 */
export async function executeStoredProcedure(
  supabase: any,
  procedureName: string,
  procedureSQL: string
): Promise<boolean> {
  try {
    // Execute the procedure or create it if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: procedureSQL
    });
    
    if (error) {
      console.error(`Error executing/creating stored procedure ${procedureName}:`, error);
      return false;
    }
    
    console.log(`Successfully executed/created stored procedure ${procedureName}`);
    return true;
  } catch (err) {
    console.error(`Error in executeStoredProcedure for ${procedureName}:`, err);
    return false;
  }
}

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
      // Create a cache key based on function name and params
      const cacheKey = `db_func:${functionName}:${JSON.stringify(params)}`;
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + cacheTTLMinutes);
      
      // Try to get from cache or create with default
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
    
    // Execute the function directly if no cache or cache miss
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

/**
 * Helper to schedule the cache cleanup task
 */
export async function scheduleCacheCleanup(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('schedule_cache_cleanup');
    
    if (error) {
      console.error("Error scheduling cache cleanup:", error);
      return false;
    }
    
    console.log("Successfully scheduled cache cleanup");
    return true;
  } catch (err) {
    console.error("Error in scheduleCacheCleanup:", err);
    return false;
  }
}
