
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY") || "";
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
    const { symbol } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // First check if we have cached filings in our database
    const { data: cachedFilings, error: dbError } = await supabase
      .from("sec_filings")
      .select("*")
      .eq("symbol", symbol)
      .order("filing_date", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
    } else if (cachedFilings && cachedFilings.length > 0) {
      console.log(`Found ${cachedFilings.length} cached SEC filings for ${symbol}`);
      return new Response(
        JSON.stringify(cachedFilings),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no cached data found, fetch from Finnhub
    console.log(`Fetching SEC filings for ${symbol} from Finnhub`);
    const finnhubUrl = `https://finnhub.io/api/v1/stock/filings?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(finnhubUrl);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }
    
    const filings = await response.json();
    
    if (!Array.isArray(filings) || filings.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform the data to match our database schema
    const transformedFilings = filings.map(filing => ({
      symbol: filing.symbol,
      type: filing.form === "10-K" ? "10-K (Annual Report)" :
            filing.form === "10-Q" ? "10-Q (Quarterly Report)" :
            filing.form === "8-K" ? "8-K (Current Report)" : 
            `${filing.form} (SEC Filing)`,
      filing_date: filing.filedDate || filing.acceptedDate,
      report_date: filing.reportDate || filing.filedDate,
      cik: filing.cik,
      form: filing.form,
      url: filing.filingUrl,
      filing_number: filing.accessNumber
    }));
    
    // Cache filings in our database (background task)
    if (transformedFilings.length > 0) {
      EdgeRuntime.waitUntil((async () => {
        try {
          // Only insert filings that we don't already have
          const { error } = await supabase
            .from("sec_filings")
            .upsert(transformedFilings, { 
              onConflict: "symbol,filing_date,form",
              ignoreDuplicates: true
            });

          if (error) {
            console.error("Error caching SEC filings:", error);
          } else {
            console.log(`Cached ${transformedFilings.length} SEC filings for ${symbol}`);
          }
        } catch (e) {
          console.error("Error in background caching task:", e);
        }
      })());
    }

    return new Response(
      JSON.stringify(transformedFilings),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-sec-filings function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
