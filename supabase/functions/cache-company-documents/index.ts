
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { cacheTranscripts } from "./transcript-cacher.ts";
import { cacheFilings } from "./filing-cacher.ts";
import { validateRequest } from "./request-validator.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, docType, validationError } = await validateRequest(req);
    
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing document caching for ${symbol}, type: ${docType}`);
    
    // Flag to track if we've made any updates
    let updatedData = false;
    
    // Handle transcripts caching
    if (docType === "transcripts" || docType === "all") {
      updatedData = await cacheTranscripts(symbol, supabaseUrl, supabaseServiceRole) || updatedData;
    }
    
    // Handle SEC filings caching
    if (docType === "filings" || docType === "all") {
      updatedData = await cacheFilings(symbol, supabaseUrl, supabaseServiceRole) || updatedData;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: updatedData ? `${docType} data for ${symbol} cached successfully` : `No new ${docType} data found for ${symbol}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error caching documents:", error);
    
    return new Response(
      JSON.stringify({ error: `Failed to cache documents: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
