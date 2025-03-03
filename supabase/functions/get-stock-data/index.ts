
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";
import { 
  fetchProfile, 
  fetchQuote, 
  fetchRating,
  createPlaceholderProfile,
  createPlaceholderQuote
} from "./company-profile.ts";
import { 
  fetchFinancials, 
  fetchBalanceSheetWithFallbacks 
} from "./financial-statements.ts";
import { 
  fetchHistoricalPrice, 
  fetchNews, 
  fetchPeers 
} from "./market-data.ts";
import { 
  fetchEarningTranscripts, 
  fetchTranscriptContent, 
  fetchSECFilings 
} from "./documents.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, endpoint, quarter, year } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Processing ${endpoint} request for ${symbol}`);
    
    let data;
    let attempts = 0;
    const maxAttempts = 3;
    
    // Use a retry wrapper for all API calls to improve reliability
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} for ${endpoint} - ${symbol}`);
        
        switch (endpoint) {
          case "profile":
            data = await fetchProfile(symbol);
            break;
          case "quote":
            data = await fetchQuote(symbol);
            break;
          case "rating":
            data = await fetchRating(symbol);
            break;
          case "income-statement":
            data = await fetchFinancials(symbol, "income-statement");
            break;
          case "balance-sheet":
            data = await fetchBalanceSheetWithFallbacks(symbol);
            break;
          case "cash-flow":
            data = await fetchFinancials(symbol, "cash-flow-statement");
            break;
          case "ratios":
            data = await fetchFinancials(symbol, "ratios");
            break;
          case "historical-price":
            data = await fetchHistoricalPrice(symbol);
            break;
          case "news":
            data = await fetchNews(symbol);
            break;
          case "peers":
            data = await fetchPeers(symbol);
            break;
          case "earning-transcripts":
            data = await fetchEarningTranscripts(symbol);
            break;
          case "transcript-content":
            if (!quarter || !year) {
              return new Response(
                JSON.stringify({ error: "Quarter and year are required for transcript content" }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
              );
            }
            data = await fetchTranscriptContent(symbol, quarter, year);
            break;
          case "sec-filings":
            data = await fetchSECFilings(symbol);
            break;
          default:
            return new Response(
              JSON.stringify({ error: `Invalid endpoint: ${endpoint}` }),
              { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }
        
        // If we got data successfully, break out of the retry loop
        if (data && (!Array.isArray(data) || data.length > 0)) {
          console.log(`Successfully retrieved ${endpoint} data for ${symbol} on attempt ${attempts}`);
          break;
        } else {
          console.warn(`Empty ${endpoint} data for ${symbol} on attempt ${attempts}, retrying...`);
          // Short delay before next attempt
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000 * attempts)); // Increasing delay with each attempt
          }
        }
      } catch (error) {
        console.error(`Error on attempt ${attempts} for ${endpoint}:`, error);
        // Short delay before next attempt
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000 * attempts)); // Increasing delay with each attempt
        } else {
          // On the last attempt, return empty data rather than throwing
          console.error(`All ${maxAttempts} attempts failed for ${endpoint} - ${symbol}`);
          data = endpoint === "balance-sheet" ? [] : 
                 endpoint === "profile" ? createPlaceholderProfile(symbol) : 
                 endpoint === "quote" ? createPlaceholderQuote(symbol) : 
                 [];
        }
      }
    }
    
    // For critical data like profile and quote, if we still don't have it after retries, 
    // create a minimal placeholder object to prevent app crashes
    if (["profile", "quote"].includes(endpoint) && (!data || !Array.isArray(data) || data.length === 0)) {
      console.warn(`Creating placeholder data for ${endpoint} - ${symbol} after all retries failed`);
      
      if (endpoint === "profile") {
        data = createPlaceholderProfile(symbol);
      } else if (endpoint === "quote") {
        data = createPlaceholderQuote(symbol);
      }
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while processing your request",
        symbol: req.json?.symbol || "unknown"
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
