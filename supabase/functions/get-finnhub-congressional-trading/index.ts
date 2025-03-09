
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  FINNHUB_API_BASE, 
  FINNHUB_API_KEY, 
  createCorsResponse, 
  createCorsErrorResponse,
  fetchFromFinnhub,
  logFinnhubApiCall
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

    console.log(`Fetching congressional trading data for symbol: ${symbol}`);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("symbol", symbol);
    
    // Add date parameters if provided (with defaults for better results)
    const currentDate = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(currentDate.getFullYear() - 3); // Expanded to 3 years for more data
    
    const fromDate = from || Math.floor(threeYearsAgo.getTime() / 1000);
    const toDate = to || Math.floor(currentDate.getTime() / 1000);
    
    queryParams.append("from", fromDate.toString());
    queryParams.append("to", toDate.toString());
    queryParams.append("token", FINNHUB_API_KEY);
    
    const url = `${FINNHUB_API_BASE}/stock/congressional-trading?${queryParams.toString()}`;
    logFinnhubApiCall(url);
    
    try {
      const data = await fetchFromFinnhub(url);
      console.log(`Received congressional trading data for ${symbol}. Data length: ${data?.data?.length || 0}`);
      
      // If no data was returned, provide a more specific message
      if (!data.data || data.data.length === 0) {
        console.log(`No congressional trading data available for ${symbol}`);
        return createCorsResponse({
          symbol,
          data: [],
          message: `No congressional trading data available for ${symbol} in the specified time period.`,
          source: "finnhub"
        });
      }
      
      // Tag the data source
      const enhancedData = {
        ...data,
        source: "finnhub"
      };
      
      return createCorsResponse(enhancedData);
    } catch (apiError) {
      console.error(`Finnhub API error for congressional trading data (${symbol}):`, apiError);
      return createCorsErrorResponse(`Failed to fetch congressional trading data from Finnhub: ${apiError.message}`);
    }
  } catch (error) {
    console.error("Error in get-finnhub-congressional-trading:", error);
    return createCorsErrorResponse(`Server error processing congressional trading request: ${error.message}`);
  }
});
