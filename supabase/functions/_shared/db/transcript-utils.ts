
/**
 * Utility functions for the earnings_transcripts table
 */

import { tableExists } from "./table-utils.ts";

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
