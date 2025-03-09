
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FINNHUB_API_BASE, FINNHUB_API_KEY, fetchFromFinnhub, createCorsResponse, createCorsErrorResponse } from "../_shared/finnhub-utils.ts";

interface SocialSentimentRequest {
  symbol: string;
  from?: string;
  to?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { symbol, from, to } = await req.json() as SocialSentimentRequest;
    
    if (!symbol) {
      return createCorsErrorResponse("Symbol is required", 400);
    }

    // Build the API URL - from/to are optional parameters
    let url = `${FINNHUB_API_BASE}/stock/social-sentiment?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    // Fetch data from Finnhub
    const data = await fetchFromFinnhub(url);
    
    return createCorsResponse(data);
  } catch (error) {
    console.error("Error in get-finnhub-social-sentiment:", error);
    return createCorsErrorResponse(error.message || "Failed to fetch social sentiment data");
  }
});
