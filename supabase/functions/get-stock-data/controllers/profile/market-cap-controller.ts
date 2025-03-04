
import { makeApiRequest, handleApiResponse } from "../../_shared/api-utils.ts";
import { FMP_API_KEY } from "../../_shared/constants.ts";
import { BaseProfileController } from "./base-profile-controller.ts";

/**
 * Controller for market cap related endpoints
 */
export class MarketCapController extends BaseProfileController {
  /**
   * Fetch company market cap
   */
  async fetchMarketCap(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/market-capitalization/${symbol}?apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "market cap", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return handleApiResponse(data, `No market cap data found for ${symbol}`);
    } catch (error) {
      console.warn(`Market cap data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch historical market cap
   */
  async fetchHistoricalMarketCap(symbol: string, limit: number = 100): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-market-capitalization/${symbol}?limit=${limit}&apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "historical market cap", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Historical market cap data fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch shares float
   */
  async fetchSharesFloat(symbol: string): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/shares-float/${symbol}?apikey=${FMP_API_KEY}`;
      this.logApiRequest(url, "shares float", symbol);
      
      const data = await makeApiRequest<any[]>(url);
      return data || [];
    } catch (error) {
      console.warn(`Shares float data fetch failed: ${error.message}`);
      return [];
    }
  }
}
