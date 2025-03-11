
import { BaseController } from "./base-controller.ts";

export class StockDataController extends BaseController {
  /**
   * Fetch historical price data
   */
  async fetchHistoricalPrice(symbol: string): Promise<any> {
    try {
      const url = this.buildUrl(`historical-price-full/${symbol}`);
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching historical price for ${symbol}:`, error);
      return { symbol, historical: [] };
    }
  }
  
  /**
   * Fetch company news
   */
  async fetchNews(symbol: string): Promise<any[]> {
    try {
      const url = this.buildUrl(`stock_news`, { tickers: symbol, limit: "10" });
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      return [];
    }
  }
  
  /**
   * Fetch company peers
   */
  async fetchPeers(symbol: string): Promise<any[]> {
    try {
      const url = this.buildUrl(`stock-peers`, { symbol });
      const data = await this.makeApiRequest<any[]>(url);
      return data.length > 0 ? data : [{ peersList: [] }];
    } catch (error) {
      console.error(`Error fetching peers for ${symbol}:`, error);
      return [{ peersList: [] }];
    }
  }
}
