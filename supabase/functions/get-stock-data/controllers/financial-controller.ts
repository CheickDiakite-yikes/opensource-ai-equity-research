
import { FinancialController as NewFinancialController } from "./financial/financial-controller.ts";

/**
 * Main financial controller that uses the refactored controller structure
 */
export class FinancialController {
  private controller: NewFinancialController;

  constructor() {
    this.controller = new NewFinancialController();
  }

  /**
   * Handle requests for financial statement data
   */
  async handleRequest(endpoint: string, symbol: string, period: string = "annual", limit: number = 5): Promise<any> {
    return this.controller.handleRequest(endpoint, symbol, period, limit);
  }
}
