
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createResponse, createErrorResponse } from "../_shared/api-utils.ts";

// Get Finnhub API key from environment variable
const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, statement, freq } = await req.json();
    
    if (!symbol) {
      return createResponse({ error: "Symbol is required" }, 400);
    }
    
    if (!statement) {
      return createResponse({ error: "Statement type is required" }, 400);
    }
    
    // Validate statement type
    if (!["bs", "ic", "cf"].includes(statement)) {
      return createResponse({ 
        error: "Invalid statement type. Must be one of: bs (balance sheet), ic (income statement), cf (cash flow)"
      }, 400);
    }
    
    // Default to annual if frequency not specified
    const frequency = freq || "annual";
    
    // Validate frequency
    if (!["annual", "quarterly", "ttm", "ytd"].includes(frequency)) {
      return createResponse({ 
        error: "Invalid frequency. Must be one of: annual, quarterly, ttm, ytd" 
      }, 400);
    }
    
    console.log(`Fetching ${statement} statement for ${symbol} with frequency ${frequency} from Finnhub`);
    
    // Build Finnhub API URL
    const url = `https://finnhub.io/api/v1/stock/financials?symbol=${symbol}&statement=${statement}&freq=${frequency}&token=${FINNHUB_API_KEY}`;
    
    // Log the API call (without showing the API key)
    console.log(`Calling Finnhub API: ${url.replace(FINNHUB_API_KEY, "API_KEY_HIDDEN")}`);
    
    // Fetch data from Finnhub API
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Finnhub API error (${response.status}): ${response.statusText}`);
      
      if (response.status === 429) {
        return createResponse({ error: "Finnhub API rate limit exceeded" }, 429);
      }
      
      if (response.status === 403) {
        return createResponse({ error: "Finnhub API access denied. Check API key." }, 403);
      }
      
      return createResponse({ error: `Finnhub API error: ${response.statusText}` }, response.status);
    }
    
    const data = await response.json();
    
    // Check if data is valid
    if (!data || !data.financials || !Array.isArray(data.financials) || data.financials.length === 0) {
      console.warn(`No ${statement} data found for ${symbol} in Finnhub`);
      return createResponse({ financials: [], symbol });
    }
    
    console.log(`Successfully retrieved ${data.financials.length} ${statement} records for ${symbol} from Finnhub`);
    
    return createResponse(data);
  } catch (error) {
    console.error("Error processing Finnhub financials request:", error);
    return createErrorResponse(error);
  }
});
