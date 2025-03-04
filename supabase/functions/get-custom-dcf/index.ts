
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
    
    // Parse the request body to get the symbol, params, and dcf type
    const { symbol, params, type = "advanced" } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter", details: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}`);
    
    // Determine which endpoint to use based on the DCF type
    let apiUrl = "";
    
    switch (type) {
      case "standard":
        // Standard DCF endpoint
        apiUrl = `https://financialmodelingprep.com/stable/discounted-cash-flow?symbol=${symbol}`;
        break;
      case "levered":
        // Levered DCF endpoint
        apiUrl = `https://financialmodelingprep.com/stable/levered-discounted-cash-flow?symbol=${symbol}`;
        
        // Add optional limit parameter if provided
        if (params?.limit) {
          apiUrl += `&limit=${params.limit}`;
        }
        break;
      case "custom-levered":
        // Custom Levered DCF endpoint
        apiUrl = `https://financialmodelingprep.com/stable/custom-levered-discounted-cash-flow?symbol=${symbol}`;
        
        // Add all provided parameters to query string
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (key !== 'symbol' && value !== undefined) {
              apiUrl += `&${key}=${value}`;
            }
          });
        }
        break;
      case "advanced":
      default:
        // Custom DCF Advanced endpoint (default)
        apiUrl = `https://financialmodelingprep.com/stable/custom-discounted-cash-flow?symbol=${symbol}`;
        
        // Add all provided parameters to query string
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (key !== 'symbol' && value !== undefined) {
              apiUrl += `&${key}=${value}`;
            }
          });
        }
        break;
    }
    
    // Add the API key
    apiUrl += `&apikey=${FMP_API_KEY}`;
    
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
