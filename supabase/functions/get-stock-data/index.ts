
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createResponse, createErrorResponse } from "../_shared/api-utils.ts";
import { ProfileController } from "./controllers/profile-controller.ts";
import { FinancialController } from "./controllers/financial-controller.ts";
import { MarketDataController } from "./controllers/market-data-controller.ts";
import { DocumentsController } from "./controllers/documents-controller.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      symbol, 
      endpoint, 
      quarter, 
      year, 
      limit, 
      period, 
      from, 
      to, 
      page, 
      date,
      sector,
      industry,
      exchange
    } = await req.json();
    
    // For market data endpoints that don't require a symbol
    const marketDataOnlyEndpoints = [
      "sector-performance", "industry-performance", 
      "historical-sector-performance", "historical-industry-performance",
      "sector-pe", "industry-pe", "historical-sector-pe", "historical-industry-pe",
      "biggest-gainers", "biggest-losers", "most-actives"
    ];
    
    if (!symbol && !marketDataOnlyEndpoints.includes(endpoint)) {
      return createResponse(
        { error: "Symbol is required" },
        400
      );
    }
    
    console.log(`Processing ${endpoint} request${symbol ? ` for ${symbol}` : ''}`);
    
    // Group endpoints by controller
    const profileController = new ProfileController();
    const financialController = new FinancialController();
    const marketDataController = new MarketDataController();
    const documentsController = new DocumentsController();
    
    // Process request based on endpoint category
    let data;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} for ${endpoint}${symbol ? ` - ${symbol}` : ''}`);
        
        // Profile and company data endpoints
        if (["profile", "quote", "rating", "peers", "market-cap", "historical-market-cap", 
             "shares-float", "executives", "executive-compensation", "company-notes", 
             "employee-count", "historical-employee-count"].includes(endpoint)) {
          data = await profileController.handleRequest(endpoint, symbol);
        }
        // Financial statements endpoints
        else if (["income-statement", "income-statement-ttm", "balance-sheet", "balance-sheet-ttm",
                  "cash-flow", "cash-flow-ttm", "ratios", "ratios-ttm", "key-metrics", 
                  "key-metrics-ttm", "financial-scores"].includes(endpoint)) {
          data = await financialController.handleRequest(endpoint, symbol, period, limit);
        }
        // Market data endpoints
        else if (["historical-price", "news", "peers",
                 "sector-performance", "industry-performance", 
                 "historical-sector-performance", "historical-industry-performance",
                 "sector-pe", "industry-pe", "historical-sector-pe", "historical-industry-pe",
                 "biggest-gainers", "biggest-losers", "most-actives"].includes(endpoint)) {
          const params = { from, to, date, sector, industry, exchange };
          data = await marketDataController.handleRequest(endpoint, symbol, params);
        }
        // Documents endpoints
        else if (["earning-transcripts", "transcript-content", "sec-filings"].includes(endpoint)) {
          if (endpoint === "transcript-content" && (!quarter || !year)) {
            return createResponse(
              { error: "Quarter and year are required for transcript content" },
              400
            );
          }
          data = await documentsController.handleRequest(endpoint, symbol, quarter, year);
        }
        else {
          return createResponse(
            { error: `Invalid endpoint: ${endpoint}` },
            400
          );
        }
        
        // If we got data successfully, break out of the retry loop
        if (data && (!Array.isArray(data) || data.length > 0)) {
          console.log(`Successfully retrieved ${endpoint} data${symbol ? ` for ${symbol}` : ''} on attempt ${attempts}`);
          break;
        } else {
          console.warn(`Empty ${endpoint} data${symbol ? ` for ${symbol}` : ''} on attempt ${attempts}, retrying...`);
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
          console.error(`All ${maxAttempts} attempts failed for ${endpoint}${symbol ? ` - ${symbol}` : ''}`);
          
          // Default empty responses based on endpoint type
          if (endpoint === "profile") {
            data = profileController.createPlaceholderProfile(symbol);
          } else if (endpoint === "quote") {
            data = profileController.createPlaceholderQuote(symbol);
          } else {
            data = [];
          }
        }
      }
    }
    
    return createResponse(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return createErrorResponse(error);
  }
});
