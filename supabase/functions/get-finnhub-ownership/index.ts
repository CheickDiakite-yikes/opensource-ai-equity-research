
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FINNHUB_API_BASE, FINNHUB_API_KEY, fetchFromFinnhub, createCorsResponse, createCorsErrorResponse, logFinnhubApiCall } from "../_shared/finnhub-utils.ts";

interface OwnershipRequest {
  symbol: string;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { symbol, limit } = await req.json() as OwnershipRequest;
    
    if (!symbol) {
      return createCorsErrorResponse("Symbol is required", 400);
    }

    // Build the API URL
    const limitParam = limit ? `&limit=${limit}` : '';
    const url = `${FINNHUB_API_BASE}/stock/ownership?symbol=${symbol}${limitParam}&token=${FINNHUB_API_KEY}`;

    // Fetch data from Finnhub
    const data = await fetchFromFinnhub(url);
    
    return createCorsResponse(data);
  } catch (error) {
    console.error("Error in get-finnhub-ownership:", error);
    return createCorsErrorResponse(error.message || "Failed to fetch ownership data");
  }
});
