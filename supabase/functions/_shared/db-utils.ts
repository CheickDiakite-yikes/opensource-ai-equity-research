
// Database utilities for Supabase functions

/**
 * Check if a table exists in the database
 */
export async function tableExists(
  supabase: any,
  table: string,
  schema: string = 'public'
): Promise<boolean> {
  try {
    // Query the information_schema to check if the table exists
    const { data, error } = await supabase.rpc('table_exists', {
      table_name: table,
      schema_name: schema
    });
    
    if (error) {
      console.error("Error checking if table exists:", error);
      return false;
    }
    
    return data;
  } catch (err) {
    console.error("Error in tableExists:", err);
    return false;
  }
}

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

/**
 * Add the stored procedure for table existence checking
 */
export async function addTableExistsFunction(supabase: any): Promise<boolean> {
  try {
    // Add the function if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: `
        CREATE OR REPLACE FUNCTION table_exists(schema_name text, table_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        DECLARE
          exists_val boolean;
        BEGIN
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = schema_name
            AND table_name = table_name
          ) INTO exists_val;
          
          RETURN exists_val;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error("Error creating table_exists function:", error);
      return false;
    }
    
    console.log("Successfully created/updated table_exists function");
    return true;
  } catch (err) {
    console.error("Error in addTableExistsFunction:", err);
    return false;
  }
}

/**
 * Optimize the earnings_transcripts table with proper indexes
 */
export async function optimizeTranscriptsTable(supabase: any): Promise<boolean> {
  try {
    // Check if the table exists first
    const exists = await tableExists(supabase, 'earnings_transcripts');
    
    if (!exists) {
      console.log("earnings_transcripts table doesn't exist");
      return false;
    }
    
    // Add indexes to the table
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: `
        -- Add index on symbol (most common query filter)
        CREATE INDEX IF NOT EXISTS idx_earnings_transcripts_symbol ON public.earnings_transcripts (symbol);
        
        -- Add index on date for chronological ordering
        CREATE INDEX IF NOT EXISTS idx_earnings_transcripts_date ON public.earnings_transcripts (date DESC);
        
        -- Add composite index for common query pattern
        CREATE INDEX IF NOT EXISTS idx_earnings_transcripts_symbol_date ON public.earnings_transcripts (symbol, date DESC);
        
        -- Add composite index for quarter+year lookup
        CREATE INDEX IF NOT EXISTS idx_earnings_transcripts_symbol_quarter_year ON public.earnings_transcripts (symbol, quarter, year);
        
        -- Add GIN index for highlights JSONB column
        CREATE INDEX IF NOT EXISTS idx_earnings_transcripts_highlights ON public.earnings_transcripts USING GIN (highlights jsonb_path_ops);
        
        -- Add fulltext search index on content (if not already exists)
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes WHERE indexname = 'idx_earnings_transcripts_content_search'
          ) THEN
            ALTER TABLE public.earnings_transcripts ADD COLUMN IF NOT EXISTS content_search tsvector 
              GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
            CREATE INDEX idx_earnings_transcripts_content_search ON public.earnings_transcripts USING GIN (content_search);
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- In case there's any error, log and continue
          RAISE NOTICE 'Error creating fulltext search index: %', SQLERRM;
        END $$;
      `
    });
    
    if (error) {
      console.error("Error optimizing earnings_transcripts table:", error);
      return false;
    }
    
    console.log("Successfully optimized earnings_transcripts table");
    return true;
  } catch (err) {
    console.error("Error in optimizeTranscriptsTable:", err);
    return false;
  }
}

/**
 * Optimize the sec_filings table with proper indexes
 */
export async function optimizeFilingsTable(supabase: any): Promise<boolean> {
  try {
    // Check if the table exists first
    const exists = await tableExists(supabase, 'sec_filings');
    
    if (!exists) {
      console.log("sec_filings table doesn't exist");
      return false;
    }
    
    // Add indexes to the table
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: `
        -- Add index on symbol (most common query filter)
        CREATE INDEX IF NOT EXISTS idx_sec_filings_symbol ON public.sec_filings (symbol);
        
        -- Add index on filing_date for chronological ordering
        CREATE INDEX IF NOT EXISTS idx_sec_filings_filing_date ON public.sec_filings (filing_date DESC);
        
        -- Add composite index for common query pattern
        CREATE INDEX IF NOT EXISTS idx_sec_filings_symbol_date ON public.sec_filings (symbol, filing_date DESC);
        
        -- Add index for form type filtering
        CREATE INDEX IF NOT EXISTS idx_sec_filings_form ON public.sec_filings (form);
        
        -- Add composite index for form type filtering by symbol
        CREATE INDEX IF NOT EXISTS idx_sec_filings_symbol_form ON public.sec_filings (symbol, form);
        
        -- Add index for CIK lookups
        CREATE INDEX IF NOT EXISTS idx_sec_filings_cik ON public.sec_filings (cik);
        
        -- Add fulltext search index on content (if not already exists)
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sec_filings_content_search'
          ) THEN
            ALTER TABLE public.sec_filings ADD COLUMN IF NOT EXISTS content_search tsvector 
              GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
            CREATE INDEX idx_sec_filings_content_search ON public.sec_filings USING GIN (content_search);
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- In case there's any error, log and continue
          RAISE NOTICE 'Error creating fulltext search index: %', SQLERRM;
        END $$;
      `
    });
    
    if (error) {
      console.error("Error optimizing sec_filings table:", error);
      return false;
    }
    
    console.log("Successfully optimized sec_filings table");
    return true;
  } catch (err) {
    console.error("Error in optimizeFilingsTable:", err);
    return false;
  }
}

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
