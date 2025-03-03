
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { filingId, url, symbol, form, filingDate } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Filing URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // First check if we have content already cached
    if (filingId) {
      const { data: existingFiling, error: getError } = await supabase
        .from("sec_filings")
        .select("content, url")
        .eq("id", filingId)
        .single();
        
      if (!getError && existingFiling && existingFiling.content) {
        console.log(`Returning cached content for filing ID ${filingId}`);
        return new Response(
          JSON.stringify({ url: existingFiling.url, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // We don't have the content cached, so we'll start a background task to fetch it
    if (symbol && form && filingDate) {
      EdgeRuntime.waitUntil((async () => {
        try {
          console.log(`Starting background task to cache SEC filing: ${symbol} ${form} ${filingDate}`);
          
          // For SEC filings, we only record that it was accessed, but don't cache the content
          // as these are typically large documents hosted by SEC.gov
          if (filingId) {
            const { error: updateError } = await supabase
              .from("sec_filings")
              .update({ last_accessed: new Date().toISOString() })
              .eq("id", filingId);
              
            if (updateError) {
              console.error("Error updating SEC filing access time:", updateError);
            }
          } else {
            // If we don't have this filing in our database yet, let's record it
            const { error: insertError } = await supabase
              .from("sec_filings")
              .insert({
                symbol,
                form,
                filing_date: filingDate,
                url,
                last_accessed: new Date().toISOString(),
                type: form === "10-K" ? "10-K (Annual Report)" :
                      form === "10-Q" ? "10-Q (Quarterly Report)" :
                      form === "8-K" ? "8-K (Current Report)" : 
                      `${form} (SEC Filing)`
              });
              
            if (insertError) {
              console.error("Error inserting new SEC filing record:", insertError);
            }
          }
        } catch (e) {
          console.error("Error in background caching task:", e);
        }
      })());
    }

    // Return the original URL or a cached URL if available
    return new Response(
      JSON.stringify({ url, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in download-sec-filing function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
