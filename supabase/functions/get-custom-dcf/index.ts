
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the FMP API key from environment variables
    const FMP_API_KEY = Deno.env.get('FMP_API_KEY');
    
    if (!FMP_API_KEY) {
      console.error("FMP_API_KEY not set in environment variables");
      return new Response(
        JSON.stringify({ error: "API key not configured", details: "FMP_API_KEY environment variable is missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Parse the request body to get the symbol and parameters
    const { symbol, params } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter", details: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing DCF request for ${symbol}`);
    
    // Construct the API URL for the FMP Custom DCF endpoint
    const apiUrl = `https://financialmodelingprep.com/api/v4/advanced_discounted_cash_flow?symbol=${symbol}&apikey=${FMP_API_KEY}`;
    
    console.log(`Calling FMP API: ${apiUrl.replace(FMP_API_KEY, 'API_KEY_HIDDEN')}`);
    
    // Fetch data from FMP API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FMP API Error (${response.status}): ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch DCF data", 
          details: `API returned status ${response.status}: ${errorText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    // Parse the API response
    const data = await response.json();
    console.log(`Received DCF data from FMP API for ${symbol}`, data);
    
    // Return the DCF data
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in get-custom-dcf function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
