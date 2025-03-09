
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildFmpQueryUrl, makeApiRequest, handleApiResponse, createResponse, createErrorResponse } from "../_shared/api-utils.ts";

interface InsiderTradingRequest {
  symbol: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { symbol } = await req.json() as InsiderTradingRequest;
    
    if (!symbol) {
      return createErrorResponse(new Error("Symbol is required"), 400);
    }
    
    // Build the API URL for insider trading statistics
    const url = buildFmpQueryUrl("insider-trading/statistics", symbol, {});

    console.log(`Fetching insider trading statistics for ${symbol}`);
    
    // Fetch data from FMP
    const data = await makeApiRequest(url, `Failed to fetch insider trading statistics for ${symbol}`);
    
    // Validate the response
    const validatedData = handleApiResponse(data, `No insider trading statistics found for ${symbol}`);
    
    console.log(`Successfully fetched insider trading statistics for ${symbol}`);
    
    return createResponse({
      symbol,
      tradingStats: validatedData
    });
  } catch (error) {
    console.error("Error in get-fmp-insider-trading-stats:", error);
    return createErrorResponse(error, 500);
  }
});
