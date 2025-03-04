
import { buildFmpUrl } from "../../_shared/api-utils.ts";
import { BaseFinancialController } from "./base-financial-controller.ts";

/**
 * Controller for income statement related endpoints
 */
export class IncomeStatementController extends BaseFinancialController {
  /**
   * Fetch income statement data
   */
  async fetchIncomeStatement(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    const url = buildFmpUrl("income-statement", symbol, { 
      limit, 
      period: period === "annual" ? "FY" : "Q" 
    });
    
    return this.fetchWithErrorHandling(url, "income statement", symbol);
  }
  
  /**
   * Fetch income statement TTM data
   */
  async fetchIncomeStatementTTM(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("income-statement-ttm", symbol);
    
    return this.fetchWithErrorHandling(url, "income statement TTM", symbol);
  }
}
