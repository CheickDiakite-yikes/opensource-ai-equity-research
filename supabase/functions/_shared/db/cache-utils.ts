
/**
 * Cache-related database utility functions
 */

import { tableExists } from "./table-utils.ts";

/**
 * Create an optimized cache table with proper indexes
 */
export async function createCacheTable(supabase: any): Promise<boolean> {
  try {
    // Check if the table already exists
    const exists = await tableExists(supabase, 'api_cache');
    
    if (exists) {
      console.log("api_cache table already exists");
      return true;
    }
    
    // Create the table with proper indexing
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: `
        CREATE TABLE IF NOT EXISTS public.api_cache (
          id SERIAL PRIMARY KEY,
          cache_key TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          metadata JSONB
        );
        
        -- Create indexes for efficient lookups
        CREATE INDEX IF NOT EXISTS idx_api_cache_cache_key ON public.api_cache (cache_key);
        CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON public.api_cache (expires_at);
        
        -- Create a composite index for the most common query pattern
        CREATE INDEX IF NOT EXISTS idx_api_cache_key_expiry ON public.api_cache (cache_key, expires_at);
        
        -- Add a GIN index for the JSONB data column to allow for efficient JSONB queries
        CREATE INDEX IF NOT EXISTS idx_api_cache_data_gin ON public.api_cache USING GIN (data jsonb_path_ops);
        
        -- Add an index to the metadata column for potential filtering
        CREATE INDEX IF NOT EXISTS idx_api_cache_metadata ON public.api_cache USING GIN (metadata jsonb_path_ops);
      `
    });
    
    if (error) {
      console.error("Error creating api_cache table:", error);
      return false;
    }
    
    console.log("Successfully created api_cache table with indexes");
    return true;
  } catch (err) {
    console.error("Error in createCacheTable:", err);
    return false;
  }
}
