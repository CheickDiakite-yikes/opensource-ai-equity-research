
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildFmpQueryUrl, makeApiRequest, handleApiResponse, createResponse, createErrorResponse } from "../_shared/api-utils.ts";

interface AcquisitionOwnershipRequest {
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
    const { symbol, limit } = await req.json() as AcquisitionOwnershipRequest;
    
    if (!symbol) {
      return createErrorResponse(new Error("Symbol is required"), 400);
    }

    // Determine limit (default to 100 if not provided)
    const limitParam = limit || 100;
    
    // Build the API URL
    const url = buildFmpQueryUrl(
      "acquisition-of-beneficial-ownership", 
      symbol, 
      { limit: limitParam }
    );

    console.log(`Fetching acquisition ownership data for ${symbol} with limit ${limitParam}`);
    
    // Fetch data from FMP
    const data = await makeApiRequest(url, `Failed to fetch acquisition ownership data for ${symbol}`);
    
    // Validate the response
    const validatedData = handleApiResponse(data, `No acquisition ownership data found for ${symbol}`);
    
    console.log(`Successfully fetched ${Array.isArray(validatedData) ? validatedData.length : 0} acquisition ownership records for ${symbol}`);
    
    return createResponse({
      symbol,
      ownershipData: validatedData
    });
  } catch (error) {
    console.error("Error in get-fmp-acquisition-ownership:", error);
    return createErrorResponse(error, 500);
  }
});
