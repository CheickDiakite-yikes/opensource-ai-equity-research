
import { buildFmpUrl } from "../../_shared/api-utils.ts";
import { BaseFinancialController } from "./base-financial-controller.ts";

/**
 * Controller for financial ratios and metrics related endpoints
 */
export class RatiosMetricsController extends BaseFinancialController {
  /**
   * Fetch financial ratios data
   */
  async fetchRatios(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    const url = buildFmpUrl("ratios", symbol, { 
      limit, 
      period: period === "annual" ? "FY" : "Q" 
    });
    
    return this.fetchWithErrorHandling(url, "financial ratios", symbol);
  }
  
  /**
   * Fetch financial ratios TTM data
   */
  async fetchRatiosTTM(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("ratios-ttm", symbol);
    
    return this.fetchWithErrorHandling(url, "financial ratios TTM", symbol);
  }
  
  /**
   * Fetch key metrics data
   */
  async fetchKeyMetrics(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    const url = buildFmpUrl("key-metrics", symbol, { 
      limit, 
      period: period === "annual" ? "FY" : "Q" 
    });
    
    return this.fetchWithErrorHandling(url, "key metrics", symbol);
  }
  
  /**
   * Fetch key metrics TTM data
   */
  async fetchKeyMetricsTTM(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("key-metrics-ttm", symbol);
    
    return this.fetchWithErrorHandling(url, "key metrics TTM", symbol);
  }
  
  /**
   * Fetch financial scores data
   */
  async fetchFinancialScores(symbol: string, limit: number = 5): Promise<any[]> {
    const url = buildFmpUrl("financial-scores", symbol, { limit });
    
    return this.fetchWithErrorHandling(url, "financial scores", symbol);
  }
}
