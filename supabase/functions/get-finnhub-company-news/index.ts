
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

    // Default to last 30 days if no dates provided
    const toDate = to || new Date().toISOString().split('T')[0];
    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `${FINNHUB_API_BASE}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`;
    const data = await fetchFromFinnhub(url);
    
    return createCorsResponse(data);
  } catch (error) {
    console.error("Error in get-finnhub-company-news:", error);
    return createCorsErrorResponse(error.message);
  }
});
