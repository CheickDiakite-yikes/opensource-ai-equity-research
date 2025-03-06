
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildDcfApiUrl } from "./dcfUrlBuilder.ts";
import { getCacheHeaders } from "./cacheUtils.ts";
import { createErrorResponse, parseRequestParams, validateRequest, createRealCompanyMockData } from "./requestHandler.ts";
import { fetchWithRetry } from "./fetchUtils.ts";

serve(async (req) => {
  // Function execution timestamp for logging
  const startTime = Date.now();
  console.log(`DCF calculation request received at ${new Date().toISOString()}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse and validate request parameters
    const { symbol, type, params } = await parseRequestParams(req);
    
    if (!symbol) {
      console.error("Missing required parameter: symbol");
      throw new Error("Symbol is required");
    }
    
    const validation = validateRequest(symbol);
    if (!validation.isValid) {
      console.error(`Invalid request for symbol ${symbol}`);
      return validation.response;
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}, with ${Object.keys(params).length} parameters`);
    
    // Build the API URL
    const apiUrl = buildDcfApiUrl(symbol, type, params);
    
    // Make the API request with improved error handling
    try {
      console.log(`Calling FMP API for ${symbol} DCF calculation...`);
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
        console.log(`No DCF data found for symbol: ${symbol}, returning realistic mock data`);
        const mockData = createRealCompanyMockData(symbol);
        
        return new Response(
          JSON.stringify(mockData),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Mock-Data': 'true',
              'X-Processing-Time': `${Date.now() - startTime}ms`,
              ...getCacheHeaders(type)
            } 
          }
        );
      }
      
      // Format the response based on type and ensure it has mockData=false
      let processedData = data;
      if (type === 'standard' && !Array.isArray(data)) {
        processedData = [data];
      }
      
      // Ensure each item has mockData property set to false
      if (Array.isArray(processedData)) {
        processedData = processedData.map(item => ({
          ...item,
          mockData: false
        }));
      }
      
      console.log(`Successfully retrieved DCF data for ${symbol} (${processedData.length} records)`);
      
      // Return the DCF data with appropriate caching headers
      return new Response(
        JSON.stringify(processedData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Mock-Data': 'false',
            'X-Processing-Time': `${Date.now() - startTime}ms`,
            ...getCacheHeaders(type)
          } 
        }
      );
    } catch (fetchError) {
      console.error(`Error fetching from FMP API: ${fetchError}`);
      
      // Return mock data with error info but using more realistic data
      const mockData = createRealCompanyMockData(symbol);
      if (Array.isArray(mockData) && mockData.length > 0) {
        mockData[0].error = fetchError instanceof Error ? fetchError.message : String(fetchError);
      }
      
      return new Response(
        JSON.stringify(mockData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Mock-Data': 'true',
            'X-Error': fetchError instanceof Error ? fetchError.message : String(fetchError),
            'X-Processing-Time': `${Date.now() - startTime}ms`,
            ...getCacheHeaders(type)
          } 
        }
      );
    }
  } catch (error) {
    console.error(`Uncaught error in DCF endpoint: ${error instanceof Error ? error.message : String(error)}`);
    return createErrorResponse(error instanceof Error ? error : new Error(String(error)));
  } finally {
    console.log(`DCF calculation request completed in ${Date.now() - startTime}ms`);
  }
});
