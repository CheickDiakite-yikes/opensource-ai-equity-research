
/**
 * Utility functions for the sec_filings table
 */

import { tableExists } from "./table-utils.ts";

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
