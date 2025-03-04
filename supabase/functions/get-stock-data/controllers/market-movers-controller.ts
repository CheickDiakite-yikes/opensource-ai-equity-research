
import { BaseController } from "./base-controller.ts";

export class MarketMoversController extends BaseController {
  /**
   * Fetch biggest stock gainers
   */
  async fetchBiggestGainers(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`biggest-gainers`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching biggest gainers:`, error);
      return [];
    }
  }

  /**
   * Fetch biggest stock losers
   */
  async fetchBiggestLosers(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`biggest-losers`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching biggest losers:`, error);
      return [];
    }
  }

  /**
   * Fetch most active stocks
   */
  async fetchMostActives(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`most-actives`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching most actives:`, error);
      return [];
    }
  }
}
