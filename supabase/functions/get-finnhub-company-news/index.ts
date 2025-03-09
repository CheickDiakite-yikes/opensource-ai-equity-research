
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FINNHUB_API_BASE, FINNHUB_API_KEY, fetchFromFinnhub, createCorsResponse, createCorsErrorResponse } from "../_shared/finnhub-utils.ts";

interface CompanyNewsRequest {
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
    const { symbol, from, to } = await req.json() as CompanyNewsRequest;
    
    if (!symbol) {
      return createCorsErrorResponse("Symbol is required", 400);
    }

    // Default date range (last 30 days)
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setDate(today.getDate() - 30);
    
    const fromDate = from || defaultFrom.toISOString().split('T')[0];
    const toDate = to || today.toISOString().split('T')[0];
    
    // Build the API URL
    const url = `${FINNHUB_API_BASE}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`;

    // Fetch data from Finnhub
    const data = await fetchFromFinnhub(url);

    // Process the data to ensure valid URLs for images
    const processedData = Array.isArray(data) ? data.map(item => ({
      ...item,
      image: item.image ? (item.image.startsWith('http') ? item.image : `https://${item.image}`) : null
    })) : [];
    
    return createCorsResponse(processedData);
  } catch (error) {
    console.error("Error in get-finnhub-company-news:", error);
    return createCorsErrorResponse(error.message || "Failed to fetch company news");
  }
});
