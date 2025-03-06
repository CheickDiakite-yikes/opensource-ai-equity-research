
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildDcfApiUrl } from "./dcfUrlBuilder.ts";
import { getCacheHeaders } from "./cacheUtils.ts";
import { createErrorResponse, parseRequestParams, validateRequest } from "./requestHandler.ts";
import { fetchWithRetry } from "./fetchUtils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse and validate request parameters
    const { symbol, type, params } = await parseRequestParams(req);
    
    if (!symbol) {
      throw new Error("Symbol is required");
    }
    
    const validation = validateRequest(symbol);
    if (!validation.isValid) {
      return validation.response;
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}`);
    
    // Build the API URL
    const apiUrl = buildDcfApiUrl(symbol, type, params);
    console.log(`Calling FMP API: ${apiUrl.replace(/apikey=[^&]+/, 'API_KEY_HIDDEN')}`);
    
    // Make the API request with improved error handling
    try {
      const response = await fetchWithRetry(apiUrl);
      
      // Check content type to ensure it's JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error(`FMP API returned non-JSON response: ${responseText.substring(0, 200)}...`);
        throw new Error('Invalid response format from FMP API');
      }
      
      // Parse the API response
      const data = await response.json();
      
      // Handle empty responses
      if (Array.isArray(data) && data.length === 0) {
        // Return mock data for empty responses instead of throwing an error
        console.log(`No DCF data found for symbol: ${symbol}, returning mock data`);
        return new Response(
          JSON.stringify([{
            symbol: symbol,
            date: new Date().toISOString().split('T')[0],
            stockPrice: 100,
            dcf: 115,
            equityValuePerShare: 115,
            wacc: 0.09,
            longTermGrowthRate: 0.03,
            freeCashFlow: 5000000000,
            revenue: 20000000000,
            ebitda: 8000000000,
            operatingCashFlow: 6000000000,
            capitalExpenditure: -1000000000,
            mockData: true
          }]),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Mock-Data': 'true',
              ...getCacheHeaders(type)
            } 
          }
        );
      }
      
      // Format the response based on type
      let processedData = data;
      if (type === 'standard' && !Array.isArray(data)) {
        processedData = [data];
      }
      
      console.log(`Successfully retrieved DCF data for ${symbol}`);
      
      // Return the DCF data with appropriate caching headers
      return new Response(
        JSON.stringify(processedData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...getCacheHeaders(type)
          } 
        }
      );
    } catch (fetchError) {
      console.error(`Error fetching from FMP API: ${fetchError}`);
      // Return mock data with error status
      return new Response(
        JSON.stringify([{
          symbol: symbol,
          date: new Date().toISOString().split('T')[0],
          stockPrice: 100,
          dcf: 115,
          equityValuePerShare: 115,
          wacc: 0.09,
          longTermGrowthRate: 0.03,
          freeCashFlow: 5000000000,
          revenue: 20000000000,
          ebitda: 8000000000,
          operatingCashFlow: 6000000000,
          capitalExpenditure: -1000000000,
          mockData: true,
          error: fetchError.message
        }]),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Mock-Data': 'true',
            ...getCacheHeaders(type)
          } 
        }
      );
    }
  } catch (error) {
    return createErrorResponse(error);
  }
});
