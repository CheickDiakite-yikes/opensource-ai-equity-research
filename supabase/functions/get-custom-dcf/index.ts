
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FMP_API_KEY, API_BASE_URLS } from "../_shared/constants.ts";

// Cache-control headers (per DCF type)
const getCacheHeaders = (type: string) => {
  let maxAge = 3600; // Default 1 hour cache
  
  // Custom DCF types that use user-defined parameters shouldn't be cached as long
  if (type === 'custom-levered' || type === 'advanced') {
    maxAge = 300; // 5 minutes for custom DCF calculations
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'Vary': 'Origin, Accept-Encoding',
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the FMP API key from environment variables
    if (!FMP_API_KEY) {
      console.error("FMP_API_KEY not set in environment variables");
      return new Response(
        JSON.stringify({ error: "API key not configured", details: "FMP_API_KEY environment variable is missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // If this is a GET request, parse the URL parameters
    let symbol, params, type;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      symbol = url.searchParams.get('symbol');
      type = url.searchParams.get('type') || 'advanced';
      
      // Extract all other parameters for the API
      params = {};
      url.searchParams.forEach((value, key) => {
        if (key !== 'symbol' && key !== 'type') {
          params[key] = value;
        }
      });
    } else {
      // Parse the request body to get the symbol, params, and dcf type
      const body = await req.json();
      symbol = body.symbol;
      params = body.params || {};
      type = body.type || "advanced";
    }
    
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
        apiUrl = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}`;
        break;
      case "levered":
        // Levered DCF endpoint
        apiUrl = `https://financialmodelingprep.com/api/v3/levered-discounted-cash-flow/${symbol}`;
        
        // Add optional limit parameter if provided
        if (params?.limit) {
          apiUrl += `?limit=${params.limit}`;
          delete params.limit;
        }
        break;
      case "custom-levered":
        // Custom Levered DCF endpoint - using the stable endpoint
        apiUrl = `https://financialmodelingprep.com/stable/custom-levered-discounted-cash-flow?symbol=${symbol}`;
        break;
      case "advanced":
      default:
        // Custom DCF Advanced endpoint - using the stable endpoint
        apiUrl = `https://financialmodelingprep.com/stable/custom-discounted-cash-flow?symbol=${symbol}`;
        break;
    }
    
    // Add all provided parameters to query string for custom endpoints
    if ((type === "advanced" || type === "custom-levered") && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          apiUrl += `&${key}=${value}`;
        }
      });
    }
    
    // Add the API key
    if (apiUrl.includes('?')) {
      apiUrl += `&apikey=${FMP_API_KEY}`;
    } else {
      apiUrl += `?apikey=${FMP_API_KEY}`;
    }
    
    console.log(`Calling FMP API: ${apiUrl.replace(FMP_API_KEY, 'API_KEY_HIDDEN')}`);
    
    // Fetch data from FMP API with better error handling
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
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
      
      // Check content type to ensure it's JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error(`FMP API returned non-JSON response: ${responseText.substring(0, 200)}...`);
        
        return new Response(
          JSON.stringify({ 
            error: "Invalid API response format", 
            details: "The API response is not in JSON format" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Parse the API response
      const data = await response.json();
      console.log(`Received DCF data from FMP API for ${symbol}`, typeof data);
      
      // For empty responses, try a fallback to v3 endpoint
      if (Array.isArray(data) && data.length === 0 && (type === "advanced" || type === "custom-levered")) {
        console.log(`Empty response from stable API, trying v3 fallback endpoint for ${symbol}`);
        
        // Determine v3 fallback URL
        let fallbackUrl = "";
        if (type === "custom-levered") {
          fallbackUrl = `https://financialmodelingprep.com/api/v3/valuation/discounted-levered-cash-flow/${symbol}?`;
        } else {
          fallbackUrl = `https://financialmodelingprep.com/api/v3/valuation/discounted-cash-flow/${symbol}?`;
        }
        
        // Add all provided parameters to query string
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              fallbackUrl += `&${key}=${value}`;
            }
          });
        }
        
        // Add the API key
        fallbackUrl += `&apikey=${FMP_API_KEY}`;
        
        console.log(`Calling FMP fallback API: ${fallbackUrl.replace(FMP_API_KEY, 'API_KEY_HIDDEN')}`);
        
        // Fetch data from FMP API fallback
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!fallbackResponse.ok) {
          console.error(`Fallback API also failed with status: ${fallbackResponse.status}`);
          // Continue with empty array rather than failing completely
          return new Response(
            JSON.stringify([]),
            { 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                ...getCacheHeaders(type)
              } 
            }
          );
        }
        
        const fallbackData = await fallbackResponse.json();
        return new Response(
          JSON.stringify(fallbackData),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              ...getCacheHeaders(type)
            } 
          }
        );
      }
      
      // Handle standard DCF response that may be just one object instead of an array
      if (!Array.isArray(data) && type === "standard") {
        const standardData = [data]; // Wrap in array for consistent handling
        return new Response(
          JSON.stringify(standardData),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              ...getCacheHeaders(type)
            } 
          }
        );
      }
      
      // For custom DCF types, ensure we update the free cash flow values
      if (type === 'advanced' || type === 'custom-levered') {
        if (Array.isArray(data)) {
          data.forEach(item => {
            // Set explicit free cash flow if missing
            if (item.freeCashFlow === undefined || item.freeCashFlow === 0) {
              const operatingCashFlow = item.operatingCashFlow || 0;
              const capitalExpenditure = item.capitalExpenditure || 0;
              item.freeCashFlow = operatingCashFlow - Math.abs(capitalExpenditure);
            }
          });
        }
      }
      
      // Return the DCF data with appropriate caching headers
      return new Response(
        JSON.stringify(data),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...getCacheHeaders(type)
          } 
        }
      );
    } catch (fetchError) {
      console.error("Error fetching from FMP API:", fetchError);
      
      // More detailed error response
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch DCF data", 
          details: fetchError instanceof Error ? fetchError.message : String(fetchError)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in get-custom-dcf function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
