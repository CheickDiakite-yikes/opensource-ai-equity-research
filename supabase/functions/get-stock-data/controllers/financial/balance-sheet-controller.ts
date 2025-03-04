
import { buildFmpUrl } from "../../../_shared/api-utils.ts";
import { BaseFinancialController } from "./base-financial-controller.ts";

/**
 * Controller for balance sheet related endpoints
 */
export class BalanceSheetController extends BaseFinancialController {
  /**
   * Fetch balance sheet data
   */
  async fetchBalanceSheet(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    const url = buildFmpUrl("balance-sheet-statement", symbol, { 
      limit, 
      period: period === "annual" ? "FY" : "Q" 
    });
    
    return this.fetchWithErrorHandling(url, "balance sheet", symbol);
  }
  
  /**
   * Fetch balance sheet TTM data
   */
  async fetchBalanceSheetTTM(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("balance-sheet-statement-ttm", symbol);
    
    return this.fetchWithErrorHandling(url, "balance sheet TTM", symbol);
  }
  
  /**
   * Try multiple balance sheet endpoints with fallbacks
   */
  async fetchBalanceSheetWithFallbacks(symbol: string): Promise<any[]> {
    // Try all possible balance sheet endpoints
    const endpoints = [
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${Deno.env.get("FMP_API_KEY")}`,
      `https://financialmodelingprep.com/api/v3/balance-sheet/${symbol}?limit=5&apikey=${Deno.env.get("FMP_API_KEY")}`,
      `https://financialmodelingprep.com/api/v3/financials/balance-sheet-statement/${symbol}?apikey=${Deno.env.get("FMP_API_KEY")}`,
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement-as-reported/${symbol}?limit=5&apikey=${Deno.env.get("FMP_API_KEY")}`
    ];
    
    let lastError = null;
    console.log(`Trying multiple balance sheet endpoints for ${symbol}`);
    
    // Try each endpoint in sequence
    for (const endpoint of endpoints) {
      try {
        const maskedEndpoint = endpoint.replace(Deno.env.get("FMP_API_KEY") || "", "API_KEY_HIDDEN");
        console.log(`Trying balance sheet endpoint: ${maskedEndpoint}`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(`Successfully fetched balance sheet from endpoint: ${maskedEndpoint}`);
            return data;
          }
        }
        
        console.log(`Endpoint ${maskedEndpoint} failed, trying next...`);
      } catch (error) {
        const maskedEndpoint = endpoint.replace(Deno.env.get("FMP_API_KEY") || "", "API_KEY_HIDDEN");
        console.error(`Error fetching from ${maskedEndpoint}:`, error);
        lastError = error;
      }
    }

    console.warn(`All balance sheet endpoints failed for ${symbol}, returning empty array`);
    return [];
  }
}
