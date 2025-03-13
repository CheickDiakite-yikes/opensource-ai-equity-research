
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
          cache_key TEXT NOT NULL UNIQUE,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          metadata JSONB,
          access_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMP WITH TIME ZONE
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
        
        -- Create an index on the last_accessed column for LRU cleanup
        CREATE INDEX IF NOT EXISTS idx_api_cache_last_accessed ON public.api_cache (last_accessed);
        
        -- Create a function to update last_accessed timestamp
        CREATE OR REPLACE FUNCTION update_api_cache_access()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.last_accessed = NOW();
          NEW.access_count = OLD.access_count + 1;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create a trigger to update last_accessed on SELECT
        CREATE TRIGGER tr_update_api_cache_access
        BEFORE UPDATE ON public.api_cache
        FOR EACH ROW
        EXECUTE FUNCTION update_api_cache_access();
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

/**
 * Create functions to manage cache entries with advanced features
 */
export async function createCacheFunctions(supabase: any): Promise<boolean> {
  try {
    // Create a function to get or create cache entries
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: `
        -- Function to get a cache entry or return a default value
        CREATE OR REPLACE FUNCTION get_or_create_cache(
          p_cache_key TEXT, 
          p_expires_at TIMESTAMP WITH TIME ZONE, 
          p_default_data JSONB DEFAULT '{}'::JSONB
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        AS $$
        DECLARE
          cached_data JSONB;
          existing_id INTEGER;
        BEGIN
          -- Try to get cached data
          SELECT data, id INTO cached_data, existing_id
          FROM api_cache
          WHERE cache_key = p_cache_key AND expires_at > NOW();
          
          -- Return cached data if found
          IF cached_data IS NOT NULL THEN
            -- Update the last_accessed timestamp and access_count
            UPDATE api_cache 
            SET last_accessed = NOW(), access_count = access_count + 1
            WHERE id = existing_id;
            
            RETURN cached_data;
          END IF;
          
          -- Check if entry exists but is expired
          SELECT id INTO existing_id
          FROM api_cache
          WHERE cache_key = p_cache_key;
          
          IF existing_id IS NOT NULL THEN
            -- Update existing entry
            UPDATE api_cache
            SET 
              data = p_default_data,
              expires_at = p_expires_at,
              last_accessed = NOW(),
              access_count = access_count + 1
            WHERE id = existing_id
            RETURNING data INTO cached_data;
          ELSE
            -- Insert default data as new entry
            INSERT INTO api_cache (cache_key, data, expires_at, last_accessed, access_count)
            VALUES (p_cache_key, p_default_data, p_expires_at, NOW(), 1)
            RETURNING data INTO cached_data;
          END IF;
          
          RETURN cached_data;
        END;
        $$;
        
        -- Function to clean LRU cache entries when the table grows too large
        CREATE OR REPLACE FUNCTION clean_lru_cache(p_max_entries INTEGER DEFAULT 1000)
        RETURNS INTEGER
        LANGUAGE plpgsql
        AS $$
        DECLARE
          v_count INTEGER;
          v_deleted INTEGER;
        BEGIN
          -- Count total entries
          SELECT COUNT(*) INTO v_count FROM api_cache;
          
          -- If below limit, do nothing
          IF v_count <= p_max_entries THEN
            RETURN 0;
          END IF;
          
          -- Delete least recently used entries
          WITH to_delete AS (
            SELECT id
            FROM api_cache
            ORDER BY last_accessed NULLS FIRST, access_count, id
            LIMIT (v_count - p_max_entries)
          )
          DELETE FROM api_cache
          WHERE id IN (SELECT id FROM to_delete)
          RETURNING id INTO v_deleted;
          
          RETURN v_deleted;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error("Error creating cache functions:", error);
      return false;
    }
    
    console.log("Successfully created cache management functions");
    return true;
  } catch (err) {
    console.error("Error in createCacheFunctions:", err);
    return false;
  }
}
