
import { corsHeaders } from "../_shared/cors.ts";
import { FMP_API_KEY } from "../_shared/constants.ts";

/**
 * Parse request parameters from GET or POST requests
 */
export const parseRequestParams = async (req: Request) => {
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
  
  return { symbol, params, type };
};

/**
 * Validate request parameters
 */
export const validateRequest = (symbol: string | null) => {
  if (!symbol) {
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ error: "Missing required parameter", details: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    };
  }
  
  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not set in environment variables");
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ error: "API key not configured", details: "FMP_API_KEY environment variable is missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    };
  }
  
  return { isValid: true };
};

/**
 * Create error response
 */
export const createErrorResponse = (error: Error) => {
  console.error("Error in get-custom-dcf function:", error);
  
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
};
