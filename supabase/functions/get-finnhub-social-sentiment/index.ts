
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  FINNHUB_API_BASE, 
  FINNHUB_API_KEY, 
  createCorsResponse, 
  createCorsErrorResponse,
  fetchFromFinnhub 
} from "../_shared/finnhub-utils.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, from, to } = await req.json();
    
    if (!symbol) {
      return createCorsErrorResponse("Symbol is required", 400);
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("symbol", symbol);
    if (from) queryParams.append("from", from);
    if (to) queryParams.append("to", to);
    queryParams.append("token", FINNHUB_API_KEY);
    
    const url = `${FINNHUB_API_BASE}/stock/social-sentiment?${queryParams.toString()}`;
    const data = await fetchFromFinnhub(url);
    
    // Log response for debugging
    console.log(`Social sentiment data for ${symbol}:`, JSON.stringify(data).slice(0, 200) + "...");
    
    // Ensure data follows expected format
    const formattedResponse = {
      symbol: symbol,
      data: data.data || []
    };
    
    return createCorsResponse(formattedResponse);
  } catch (error) {
    console.error("Error in get-finnhub-social-sentiment:", error);
    return createCorsErrorResponse(error.message);
  }
});
