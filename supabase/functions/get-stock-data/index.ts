
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(req.headers.get("Authorization")?.split(" ")[1] || "");
    const { symbol, endpoint, limit = 10 } = await req.json();

    // For general-latest endpoint, symbol is optional
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Endpoint is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define cache key
    const cacheKey = symbol 
      ? `${endpoint}_${symbol}_${limit}`.toLowerCase()
      : `${endpoint}_${limit}`.toLowerCase();
    
    // Check for cached data if user is authenticated
    let cachedData = null;
    if (user) {
      const { data: functionData } = await supabase.rpc('get_or_create_cache', {
        p_user_id: user.id,
        p_cache_key: cacheKey,
        p_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        p_default_data: {}
      });
      
      if (functionData && Object.keys(functionData).length > 0) {
        cachedData = functionData;
      }
    }

    if (cachedData) {
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine the correct FMP API URL based on the endpoint
    let url;
    switch (endpoint) {
      case "profile":
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
        break;
      case "quote":
        url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`;
        break;
      case "income-statement":
        url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
        break;
      case "balance-sheet":
        url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
        break;
      case "cash-flow":
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
        break;
      case "key-metrics":
        url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
        break;
      case "ratios":
        url = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
        break;
      case "historical-price":
        url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
        break;
      case "news":
        url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`;
        break;
      case "peers":
        url = `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
        break;
      case "general-latest":
        url = `https://financialmodelingprep.com/api/v3/fmp/articles?page=0&size=${limit}&apikey=${FMP_API_KEY}`;
        break;
      case "press-releases-latest":
        url = `https://financialmodelingprep.com/api/v3/press-releases/${symbol}?limit=${limit}&apikey=${FMP_API_KEY}`;
        break;
      case "stock-latest":
        url = `https://financialmodelingprep.com/api/v3/stock_news?limit=${limit}&apikey=${FMP_API_KEY}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Fetching data from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);

    // Fetch data from FMP API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FMP API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received data from FMP API: ${data ? (Array.isArray(data) ? `${data.length} items` : 'object') : 'null'}`);

    // Store in cache if authenticated
    if (user && data) {
      await supabase.rpc('get_or_create_cache', {
        p_user_id: user.id,
        p_cache_key: cacheKey,
        p_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        p_default_data: data
      });
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-stock-data function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
