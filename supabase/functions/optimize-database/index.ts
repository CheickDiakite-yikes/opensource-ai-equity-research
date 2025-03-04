
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
        
        // Schedule the cleanup task to run
        await scheduleCacheCleanup(supabase);
        
        resultMsg = "Successfully set up database tables and functions";
        break;
        
      case 'optimize-indexes':
        // Optimize existing tables with indexes
        await optimizeTranscriptsTable(supabase);
        await optimizeFilingsTable(supabase);
        
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
