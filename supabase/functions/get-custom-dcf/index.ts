
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseRequestParams, validateRequest, createErrorResponse } from "./requestHandler.ts";
import { buildDcfApiUrl } from "./dcfUrlBuilder.ts";
import { getCacheHeaders } from "./cacheUtils.ts";
import { fetchWithRetry } from "./fetchUtils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request parameters
    const { symbol, params, type } = await parseRequestParams(req);
    
    // Validate request
    const validation = validateRequest(symbol);
    if (!validation.isValid) {
      return validation.response;
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}`);
    
    // Build the API URL
    const apiUrl = buildDcfApiUrl(symbol!, type!, params);
    
    console.log(`Calling FMP API: ${apiUrl.replace(/apikey=[^&]+/, 'API_KEY_HIDDEN')}`);
    
    // Fetch data from FMP API with retries
    const response = await fetchWithRetry(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    }, 3);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FMP API Error (${response.status}): ${errorText}`);
      throw new Error(`FMP API Error (${response.status}): ${errorText}`);
    }
    
    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(`FMP API returned non-JSON response: ${responseText.substring(0, 200)}...`);
      throw new Error('Invalid response format from FMP API');
    }
    
    // Parse the API response
    const data = await response.json();
    
    // If we got an empty array, throw an error
    if (Array.isArray(data) && data.length === 0) {
      throw new Error(`No DCF data found for symbol: ${symbol}`);
    }
    
    console.log(`Received DCF data for ${symbol}, type: ${type}`);
    
    // Return the DCF data with appropriate caching headers
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...getCacheHeaders(type!)
        } 
      }
    );
    
  } catch (error) {
    return createErrorResponse(error instanceof Error ? error : new Error(String(error)));
  }
});
