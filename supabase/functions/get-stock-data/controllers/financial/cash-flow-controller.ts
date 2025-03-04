
import { buildFmpUrl } from "../../_shared/api-utils.ts";
import { BaseFinancialController } from "./base-financial-controller.ts";

/**
 * Controller for cash flow statement related endpoints
 */
export class CashFlowController extends BaseFinancialController {
  /**
   * Fetch cash flow statement data
   */
  async fetchCashFlow(symbol: string, period: string = "annual", limit: number = 5): Promise<any[]> {
    const url = buildFmpUrl("cash-flow-statement", symbol, { 
      limit, 
      period: period === "annual" ? "FY" : "Q" 
    });
    
    return this.fetchWithErrorHandling(url, "cash flow statement", symbol);
  }
  
  /**
   * Fetch cash flow TTM data
   */
  async fetchCashFlowTTM(symbol: string): Promise<any[]> {
    const url = buildFmpUrl("cash-flow-statement-ttm", symbol);
    
    return this.fetchWithErrorHandling(url, "cash flow TTM", symbol);
  }
}
