
import { formatApiParams } from "../_shared/dcf/parameterUtils.ts";
import { enhanceCustomDCFData, createErrorResponse, createJsonResponse } from "../_shared/dcf/responseUtils.ts";
import { fetchDCFData, tryFallbackEndpoint } from "../_shared/dcf/dcfApiService.ts";

export async function handleDCFRequest(req: Request): Promise<Response> {
  try {
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
      return createErrorResponse(
        "Missing required parameter", 
        "Symbol is required", 
        400
      );
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}`);
    console.log("Parameters received:", params);
    
    // Format parameters for the FMP API
    const formattedParams = formatApiParams(params);
    console.log("Formatted parameters:", formattedParams);
    
    // Fetch DCF data from primary endpoint
    let data;
    try {
      data = await fetchDCFData(type, symbol, params);
    } catch (error) {
      console.error("Error fetching DCF data:", error);
      return createErrorResponse(
        "Failed to fetch DCF data", 
        error instanceof Error ? error.message : String(error), 
        500
      );
    }
    
    // For empty responses, try a fallback to v3 endpoint
    if (Array.isArray(data) && data.length === 0 && (type === "advanced" || type === "custom-levered")) {
      console.log(`Empty response from stable API, trying v3 fallback endpoint for ${symbol}`);
      
      const fallbackData = await tryFallbackEndpoint(type, symbol, formattedParams);
      if (fallbackData) {
        data = fallbackData;
      }
    }
    
    // Handle standard DCF response that may be just one object instead of an array
    if (!Array.isArray(data) && type === "standard") {
      data = [data]; // Wrap in array for consistent handling
    }
    
    // Process and enhance DCF data
    const enhancedData = enhanceCustomDCFData(data, type);
    
    // Return the DCF data with appropriate caching headers
    return createJsonResponse(enhancedData, type);
    
  } catch (error) {
    console.error("Error in handleDCFRequest:", error);
    
    return createErrorResponse(
      "Internal server error", 
      error instanceof Error ? error.message : String(error), 
      500
    );
  }
}
