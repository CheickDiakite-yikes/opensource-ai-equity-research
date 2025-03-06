
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Parse request parameters from the request object
 */
export const parseRequestParams = async (req: Request) => {
  try {
    // For GET requests, parse URL params
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const symbol = url.searchParams.get('symbol') || '';
      const type = url.searchParams.get('type') || 'standard';
      
      // Extract all other parameters
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        if (key !== 'symbol' && key !== 'type') {
          params[key] = value;
        }
      });
      
      return { symbol, type, params };
    } 
    
    // For POST requests, parse JSON body
    const body = await req.json();
    const symbol = body.symbol || '';
    const type = body.type || 'standard';
    const params = body.params || {};
    
    return { symbol, type, params };
  } catch (error) {
    console.error("Error parsing request parameters:", error);
    throw new Error("Invalid request format");
  }
};

/**
 * Validate a symbol for DCF calculation
 */
export const validateRequest = (symbol: string) => {
  if (!symbol || typeof symbol !== 'string') {
    return {
      isValid: false,
      response: createErrorResponse(new Error("Symbol is required"))
    };
  }
  
  if (symbol.length > 10) {
    return {
      isValid: false,
      response: createErrorResponse(new Error("Invalid symbol format"))
    };
  }
  
  return { isValid: true };
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const details = error instanceof Error && error.stack ? error.stack : undefined;
  
  console.error(`Error in get-custom-dcf function: ${message}`);
  
  return new Response(
    JSON.stringify({
      error: message,
      details: details,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 500, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
};
