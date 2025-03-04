
import { makeApiRequest, buildFmpUrl, logApiRequest, createPlaceholderResponse } from "../../_shared/api-utils.ts";
import { ERROR_MESSAGES } from "../../_shared/constants.ts";
import { fetchWithRetry } from "../../_shared/fetch-utils.ts";

export class FinancialController {
  /**
   * Handle requests for financial statement data
   */
  async handleRequest(endpoint: string, symbol: string, period: string = "annual", limit: number = 5): Promise<any> {
    try {
      switch (endpoint) {
        case "income-statement":
          return await this.fetchIncomeStatement(symbol, period, limit);
        case "income-statement-ttm":
          return await this.fetchIncomeStatementTTM(symbol);
        case "balance-sheet":
          return await this.fetchBalanceSheet(symbol, period, limit);
        case "balance-sheet-ttm":
          return await this.fetchBalanceSheetTTM(symbol);
        case "cash-flow":
          return await this.fetchCashFlow(symbol, period, limit);
        case "cash-flow-ttm":
          return await this.fetchCashFlowTTM(symbol);
        case "ratios":
          return await this.fetchRatios(symbol, period, limit);
        case "ratios-ttm":
          return await this.fetchRatiosTTM(symbol);
        case "key-metrics":
          return await this.fetchKeyMetrics(symbol, period, limit);
        case "key-metrics-ttm":
          return await this.fetchKeyMetricsTTM(symbol);
        case "financial-scores":
          return await this.fetchFinancialScores(symbol, limit);
        default:
          throw new Error(`Unsupported financial endpoint: ${endpoint}`);
      }
    } catch (error) {
      console.error(`Error in financial controller for ${endpoint} - ${symbol}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch income statement data
   */
  async fetchIncomeStatement(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    try {
      const url = buildFmpUrl("income-statement", symbol, { 
        limit, 
        period: period === "annual" ? "FY" : "Q" 
      });
      
      logApiRequest(url, "income statement", symbol);
      
      const response = await fetchWithRetry(url);
      
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
   * Fetch income statement TTM data
   */
  async fetchIncomeStatementTTM(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("income-statement-ttm", symbol);
      logApiRequest(url, "income statement TTM", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch TTM income statement for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No TTM income statement data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching TTM income statement:", error);
      return [];
    }
  }
  
  /**
   * Fetch balance sheet data with proper endpoint
   */
  async fetchBalanceSheet(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    try {
      const url = buildFmpUrl("balance-sheet-statement", symbol, { 
        limit, 
        period: period === "annual" ? "FY" : "Q" 
      });
      
      logApiRequest(url, "balance sheet", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch balance sheet data for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No balance sheet data found for ${symbol}`);
        // Try fallback methods
        return await this.fetchBalanceSheetWithFallbacks(symbol);
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching balance sheet:", error);
      // Try fallback methods
      return await this.fetchBalanceSheetWithFallbacks(symbol);
    }
  }
  
  /**
   * Fetch balance sheet TTM data
   */
  async fetchBalanceSheetTTM(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("balance-sheet-statement-ttm", symbol);
      logApiRequest(url, "balance sheet TTM", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch TTM balance sheet for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No TTM balance sheet data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching TTM balance sheet:", error);
      return [];
    }
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
        const response = await fetchWithRetry(endpoint);
        
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
  
  /**
   * Fetch cash flow statement data
   */
  async fetchCashFlow(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    try {
      const url = buildFmpUrl("cash-flow-statement", symbol, { 
        limit, 
        period: period === "annual" ? "FY" : "Q" 
      });
      
      logApiRequest(url, "cash flow statement", symbol);
      
      const response = await fetchWithRetry(url);
      
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
   * Fetch cash flow TTM data
   */
  async fetchCashFlowTTM(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("cash-flow-statement-ttm", symbol);
      logApiRequest(url, "cash flow TTM", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch TTM cash flow for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No TTM cash flow data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching TTM cash flow:", error);
      return [];
    }
  }
  
  /**
   * Fetch financial ratios data
   */
  async fetchRatios(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    try {
      const url = buildFmpUrl("ratios", symbol, { 
        limit, 
        period: period === "annual" ? "FY" : "Q" 
      });
      
      logApiRequest(url, "financial ratios", symbol);
      
      const response = await fetchWithRetry(url);
      
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
  
  /**
   * Fetch financial ratios TTM data
   */
  async fetchRatiosTTM(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("ratios-ttm", symbol);
      logApiRequest(url, "financial ratios TTM", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch TTM ratios for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No TTM ratios data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching TTM ratios:", error);
      return [];
    }
  }
  
  /**
   * Fetch key metrics data
   */
  async fetchKeyMetrics(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    try {
      const url = buildFmpUrl("key-metrics", symbol, { 
        limit, 
        period: period === "annual" ? "FY" : "Q" 
      });
      
      logApiRequest(url, "key metrics", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch key metrics for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No key metrics data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching key metrics:", error);
      return [];
    }
  }
  
  /**
   * Fetch key metrics TTM data
   */
  async fetchKeyMetricsTTM(symbol: string): Promise<any[]> {
    try {
      const url = buildFmpUrl("key-metrics-ttm", symbol);
      logApiRequest(url, "key metrics TTM", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch TTM key metrics for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No TTM key metrics data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching TTM key metrics:", error);
      return [];
    }
  }
  
  /**
   * Fetch financial scores data
   */
  async fetchFinancialScores(symbol: string, limit: number = 5): Promise<any[]> {
    try {
      const url = buildFmpUrl("financial-scores", symbol, { limit });
      logApiRequest(url, "financial scores", symbol);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        console.error(`API error (${response.status}): Unable to fetch financial scores for ${symbol}`);
        return [];
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        console.error(`No financial scores data found for ${symbol}`);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching financial scores:", error);
      return [];
    }
  }
}
