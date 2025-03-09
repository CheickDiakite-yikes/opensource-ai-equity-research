
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FINNHUB_API_BASE, FINNHUB_API_KEY, fetchFromFinnhub, createCorsResponse, createCorsErrorResponse } from "../_shared/finnhub-utils.ts";

interface CongressionalTradingRequest {
  symbol: string;
  from: string;
  to: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { symbol, from, to } = await req.json() as CongressionalTradingRequest;
    
    if (!symbol) {
      return createCorsErrorResponse("Symbol is required", 400);
    }
    
    // Both from and to are required parameters for this endpoint
    if (!from || !to) {
      return createCorsErrorResponse("Both 'from' and 'to' dates are required", 400);
    }

    // Build the API URL
    const url = `${FINNHUB_API_BASE}/stock/congressional-trading?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

    // Fetch data from Finnhub
    const data = await fetchFromFinnhub(url);
    
    return createCorsResponse(data);
  } catch (error) {
    console.error("Error in get-finnhub-congressional-trading:", error);
    return createCorsErrorResponse(error.message || "Failed to fetch congressional trading data");
  }
});
