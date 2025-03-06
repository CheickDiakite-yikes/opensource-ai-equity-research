
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
    
    // Parse request parameters
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
      // Parse the request body for POST requests
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
    
    // Determine which FMP endpoint to use based on DCF type
    let apiUrl = "";
    
    switch (type) {
      case "standard":
        // Standard DCF endpoint
        apiUrl = `${API_BASE_URLS.FMP}/discounted-cash-flow/${symbol}`;
        break;
      case "levered":
        // Levered DCF endpoint
        apiUrl = `${API_BASE_URLS.FMP}/levered-discounted-cash-flow/${symbol}`;
        break;
      case "custom-levered":
        // Custom Levered DCF endpoint - using the stable endpoint
        apiUrl = `${API_BASE_URLS.FMP_STABLE}/custom-levered-discounted-cash-flow?symbol=${symbol}`;
        break;
      case "advanced":
      default:
        // Custom DCF Advanced endpoint - using the stable endpoint
        apiUrl = `${API_BASE_URLS.FMP_STABLE}/custom-discounted-cash-flow?symbol=${symbol}`;
        break;
    }
    
    // Add all provided parameters to query string for custom endpoints
    if ((type === "advanced" || type === "custom-levered") && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert percentage values to decimals if needed
          if (['longTermGrowthRate', 'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'].includes(key)) {
            if (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value) > 0.2) {
              value = (parseFloat(value) / 100).toString();
            }
          }
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
    
    // Fetch data from FMP API with retries
    const response = await fetchWithRetry(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    }, 3);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FMP API Error (${response.status}): ${errorText}`);
      throw new Error(`FMP API Error (${response.status}): ${errorText}`);
    }
    
    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(`FMP API returned non-JSON response: ${responseText.substring(0, 200)}...`);
      throw new Error('Invalid response format from FMP API');
    }
    
    // Parse the API response
    const data = await response.json();
    
    // If we got an empty array, throw an error
    if (Array.isArray(data) && data.length === 0) {
      throw new Error(`No DCF data found for symbol: ${symbol}`);
    }
    
    console.log(`Received DCF data for ${symbol}, type: ${type}`);
    
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
    
  } catch (error) {
    console.error("Error in get-custom-dcf function:", error);
    
    // Return a clear error response
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to fetch DCF data",
        details: "An error occurred while fetching DCF data from the FMP API"
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

/**
 * Fetch with retry functionality
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error(`Fetch error (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
}
