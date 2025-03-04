
import { IncomeStatementController } from "./income-statement-controller.ts";
import { BalanceSheetController } from "./balance-sheet-controller.ts";
import { CashFlowController } from "./cash-flow-controller.ts";
import { RatiosMetricsController } from "./ratios-metrics-controller.ts";

/**
 * Facade controller for all financial data endpoints
 */
export class FinancialController {
  private incomeStatementController: IncomeStatementController;
  private balanceSheetController: BalanceSheetController;
  private cashFlowController: CashFlowController;
  private ratiosMetricsController: RatiosMetricsController;
  
  constructor() {
    this.incomeStatementController = new IncomeStatementController();
    this.balanceSheetController = new BalanceSheetController();
    this.cashFlowController = new CashFlowController();
    this.ratiosMetricsController = new RatiosMetricsController();
  }

  /**
   * Handle requests for financial statement data
   */
  async handleRequest(endpoint: string, symbol: string, period: string = "annual", limit: number = 5): Promise<any> {
    try {
      switch (endpoint) {
        case "income-statement":
          return await this.incomeStatementController.fetchIncomeStatement(symbol, period, limit);
        case "income-statement-ttm":
          return await this.incomeStatementController.fetchIncomeStatementTTM(symbol);
        case "balance-sheet":
          return await this.balanceSheetController.fetchBalanceSheet(symbol, period, limit);
        case "balance-sheet-ttm":
          return await this.balanceSheetController.fetchBalanceSheetTTM(symbol);
        case "cash-flow":
          return await this.cashFlowController.fetchCashFlow(symbol, period, limit);
        case "cash-flow-ttm":
          return await this.cashFlowController.fetchCashFlowTTM(symbol);
        case "ratios":
          return await this.ratiosMetricsController.fetchRatios(symbol, period, limit);
        case "ratios-ttm":
          return await this.ratiosMetricsController.fetchRatiosTTM(symbol);
        case "key-metrics":
          return await this.ratiosMetricsController.fetchKeyMetrics(symbol, period, limit);
        case "key-metrics-ttm":
          return await this.ratiosMetricsController.fetchKeyMetricsTTM(symbol);
        case "financial-scores":
          return await this.ratiosMetricsController.fetchFinancialScores(symbol, limit);
        default:
          throw new Error(`Unsupported financial endpoint: ${endpoint}`);
      }
    } catch (error) {
      console.error(`Error in financial controller for ${endpoint} - ${symbol}:`, error);
      return [];
    }
  }
}
