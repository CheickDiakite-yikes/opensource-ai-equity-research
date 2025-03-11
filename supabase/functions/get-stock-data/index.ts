
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchHistoricalPrice, fetchNews, fetchPeers } from "./market-data.ts";
import { ProfileController } from "./controllers/profile-controller.ts";
import { FinancialController } from "./controllers/financial/financial-controller.ts";
import { MarketDataController } from "./controllers/market-data-controller.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { symbol, endpoint, period, type, limit, date, from, to, sector, industry, exchange, short } = await req.json();
    let result;
    
    // Profile endpoints
    const profileController = new ProfileController();
    if (["profile", "quote", "rating", "market-cap", "shares-float", "executives", 
         "executive-compensation", "company-notes", "employee-count", 
         "historical-market-cap", "historical-employee-count"].includes(endpoint)) {
      result = await profileController.handleRequest(endpoint, symbol, { limit, date });
    }
    
    // Financial statement endpoints
    else if (["income-statement", "balance-sheet", "cash-flow", "key-metrics", 
             "financial-ratios", "financial-growth", "financial-score",
             "income-statement-ttm", "balance-sheet-ttm", "cash-flow-ttm",
             "key-metrics-ttm", "ratios-ttm"].includes(endpoint)) {
      const financialController = new FinancialController();
      result = await financialController.handleRequest(endpoint, symbol, { period, limit });
    }
    
    // Market data endpoints
    else if (["historical-price", "news", "peers", "sector-performance", "industry-performance",
              "market-indices", "biggest-gainers", "biggest-losers", "most-actives"].includes(endpoint)) {
      const marketDataController = new MarketDataController();
      result = await marketDataController.handleRequest(endpoint, symbol, { from, to, date, sector, industry, exchange, short });
    }
    
    // Legacy endpoints (direct functions)
    else if (endpoint === "historical-price") {
      result = await fetchHistoricalPrice(symbol);
    }
    else if (endpoint === "news") {
      result = await fetchNews(symbol);
    }
    else if (endpoint === "peers") {
      result = await fetchPeers(symbol);
    }
    else {
      throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error in get-stock-data function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "An unknown error occurred" 
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
