
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  tableExists,
  createCacheTable,
  addTableExistsFunction,
  optimizeTranscriptsTable,
  optimizeFilingsTable,
  executeStoredProcedure,
  scheduleCacheCleanup
} from "../_shared/db/index.ts";

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Verify this is an authorized request
  try {
    // Parse request parameters
    const { action } = await req.json();
    
    // Create Supabase client with service role key (admin privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log(`Executing database optimization action: ${action}`);
    
    let result;
    let resultMsg = "";
    
    // Execute the requested action
    switch (action) {
      case 'setup-tables':
        // Set up helper functions and tables
        await addTableExistsFunction(supabase);
        await createCacheTable(supabase);
        
        // Create cleanup function for API cache
        const cleanupCacheProcedure = `
          CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
          RETURNS void
          LANGUAGE plpgsql
          AS $$
          BEGIN
            DELETE FROM public.api_cache
            WHERE expires_at < NOW();
          END;
          $$;
        `;
        await executeStoredProcedure(supabase, 'cleanup_expired_cache', cleanupCacheProcedure);
        
        // Create function to get cache by key
        const getCacheProcedure = `
          CREATE OR REPLACE FUNCTION public.get_cache(p_cache_key TEXT)
          RETURNS JSONB
          LANGUAGE plpgsql
          AS $$
          DECLARE
            v_data JSONB;
          BEGIN
            -- Get data if it exists and is not expired
            SELECT data INTO v_data 
            FROM public.api_cache
            WHERE cache_key = p_cache_key
              AND expires_at > NOW();
              
            RETURN v_data;
          END;
          $$;
        `;
        await executeStoredProcedure(supabase, 'get_cache', getCacheProcedure);
        
        // Create function to set cache with TTL
        const setCacheProcedure = `
          CREATE OR REPLACE FUNCTION public.set_cache(
            p_cache_key TEXT, 
            p_data JSONB, 
            p_ttl_minutes INTEGER DEFAULT 60
          )
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          AS $$
          DECLARE
            existing_id INTEGER;
          BEGIN
            -- Check if entry already exists
            SELECT id INTO existing_id 
            FROM public.api_cache
            WHERE cache_key = p_cache_key;
            
            IF existing_id IS NOT NULL THEN
              -- Update existing entry
              UPDATE public.api_cache
              SET 
                data = p_data,
                expires_at = NOW() + (p_ttl_minutes * INTERVAL '1 minute')
              WHERE id = existing_id;
            ELSE
              -- Insert new entry
              INSERT INTO public.api_cache (cache_key, data, expires_at)
              VALUES (
                p_cache_key, 
                p_data, 
                NOW() + (p_ttl_minutes * INTERVAL '1 minute')
              );
            END IF;
              
            RETURN TRUE;
          END;
          $$;
        `;
        await executeStoredProcedure(supabase, 'set_cache', setCacheProcedure);
        
        // Schedule the cleanup task to run
        await scheduleCacheCleanup(supabase);
        
        resultMsg = "Successfully set up database tables and functions";
        break;
        
      case 'optimize-indexes':
        // Optimize existing tables with indexes
        await optimizeTranscriptsTable(supabase);
        await optimizeFilingsTable(supabase);
        
        // Create a new procedure to analyze tables for better performance
        const analyzeTablesProcedure = `
          CREATE OR REPLACE PROCEDURE public.analyze_all_tables()
          LANGUAGE plpgsql
          AS $$
          BEGIN
            -- Analyze these tables for better query planning
            ANALYZE public.api_cache;
            ANALYZE public.earnings_transcripts;
            ANALYZE public.sec_filings;
            ANALYZE public.stock_prediction_history;
          END;
          $$;
        `;
        await executeStoredProcedure(supabase, 'analyze_all_tables', analyzeTablesProcedure);
        
        // Run the analyze procedure
        const { error: analyzeError } = await supabase.rpc('execute_sql', {
          sql_statement: 'CALL public.analyze_all_tables();'
        });
        
        if (analyzeError) {
          console.error("Error analyzing tables:", analyzeError);
        }
        
        resultMsg = "Successfully optimized database indexes";
        break;
        
      case 'cleanup-cache':
        // Execute cache cleanup
        const { error } = await supabase.rpc('cleanup_expired_cache');
        
        if (error) {
          throw new Error(`Failed to clean up cache: ${error.message}`);
        }
        
        resultMsg = "Successfully cleaned up expired cache entries";
        break;
        
      case 'maintenance':
        // Run a complete maintenance routine
        await optimizeTranscriptsTable(supabase);
        await optimizeFilingsTable(supabase);
        await supabase.rpc('cleanup_expired_cache');
        
        // Run ANALYZE on tables to update statistics
        const { error: maintError } = await supabase.rpc('execute_sql', {
          sql_statement: 'CALL public.analyze_all_tables();'
        });
        
        if (maintError) {
          console.error("Error during maintenance:", maintError);
        }
        
        resultMsg = "Successfully performed complete database maintenance";
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: resultMsg
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in optimize-database function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Database optimization failed", 
        details: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});
