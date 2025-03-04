
import { makeApiRequest, buildFmpUrl } from "../../_shared/api-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

export class FinancialController {
  /**
   * Handle requests for financial statement data
   */
  async handleRequest(endpoint: string, symbol: string): Promise<any> {
    switch (endpoint) {
      case "income-statement":
        return await this.fetchIncomeStatement(symbol);
      case "balance-sheet":
        return await this.fetchBalanceSheetWithFallbacks(symbol);
      case "cash-flow":
        return await this.fetchCashFlow(symbol);
      case "ratios":
        return await this.fetchRatios(symbol);
      default:
        throw new Error(`Unsupported financial endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch income statement data
   */
  async fetchIncomeStatement(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("income-statement", symbol);
      console.log(`Fetching income statement from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch income statement data for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No income statement data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching income statement:", error);
      return [];
    }
  }
  
  /**
   * Try multiple balance sheet endpoints with fallbacks
   */
  async fetchBalanceSheetWithFallbacks(symbol: string): Promise<any[]> {
    // Try all possible balance sheet endpoints
    const endpoints = [
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`,
      `https://financialmodelingprep.com/api/v3/balance-sheet/${symbol}?limit=5&apikey=${FMP_API_KEY}`,
      `https://financialmodelingprep.com/api/v3/financials/balance-sheet-statement/${symbol}?apikey=${FMP_API_KEY}`,
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement-as-reported/${symbol}?limit=5&apikey=${FMP_API_KEY}`
    ];
    
    let lastError = null;
    console.log(`Trying multiple balance sheet endpoints for ${symbol}`);
    
    // Try each endpoint in sequence
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying balance sheet endpoint: ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(`Successfully fetched balance sheet from endpoint: ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
            return data;
          }
        }
        
        console.log(`Endpoint ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")} failed, trying next...`);
      } catch (error) {
        console.error(`Error fetching from ${endpoint.replace(FMP_API_KEY, "API_KEY_HIDDEN")}:`, error);
        lastError = error;
      }
    }

    console.warn(`All balance sheet endpoints failed for ${symbol}, returning empty array`);
    return [];
  }
  
  /**
   * Fetch cash flow statement data
   */
  async fetchCashFlow(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("cash-flow-statement", symbol);
      console.log(`Fetching cash flow statement from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch cash flow data for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No cash flow data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching cash flow statement:", error);
      return [];
    }
  }
  
  /**
   * Fetch financial ratios data
   */
  async fetchRatios(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("ratios", symbol);
      console.log(`Fetching ratios from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch ratios data for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No ratios data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching ratios:", error);
      return [];
    }
  }
}
