
import { corsHeaders } from "../_shared/cors.ts";
import { FMP_API_KEY } from "../_shared/constants.ts";

/**
 * Parse request parameters from GET or POST requests
 */
export const parseRequestParams = async (req: Request) => {
  let symbol = null;
  let type = 'standard';
  let params = {};
  
  if (req.method === 'GET') {
    const url = new URL(req.url);
    symbol = url.searchParams.get('symbol');
    type = url.searchParams.get('type') || 'standard';
    
    // Extract all other parameters for the API
    url.searchParams.forEach((value, key) => {
      if (key !== 'symbol' && key !== 'type') {
        params[key] = value;
      }
    });
  } else if (req.method === 'POST') {
    try {
      const body = await req.json();
      symbol = body.symbol;
      type = body.type || 'standard';
      params = body.params || {};
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid request body: Could not parse JSON");
    }
  }
  
  // Normalize type to ensure it's one of our supported types
  if (!['standard', 'levered', 'custom-levered', 'advanced'].includes(type)) {
    type = 'standard';
  }
  
  return { symbol, type, params };
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
 * Create a standardized error response
 */
export const createErrorResponse = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Error in get-custom-dcf function:", errorMessage);
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      details: "An error occurred while fetching DCF data from the FMP API",
      mockData: true
    }),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Mock-Data': 'true'
      },
      status: 500
    }
  );
};
