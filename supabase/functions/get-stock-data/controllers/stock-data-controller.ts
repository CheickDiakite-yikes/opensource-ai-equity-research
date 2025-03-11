
import { BaseController } from "./base-controller.ts";
import { fetchMarketIndices, fetchHistoricalPrice, fetchNews, fetchPeers, fetchSectorPerformance } from "../market-data.ts";

export class StockDataController extends BaseController {
  /**
   * Fetch historical price data
   */
  async fetchHistoricalPrice(symbol: string): Promise<any> {
    try {
      return await fetchHistoricalPrice(symbol);
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
      return await fetchNews(symbol);
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
      return await fetchPeers(symbol);
    } catch (error) {
      console.error(`Error fetching peers for ${symbol}:`, error);
      return [{ peersList: [] }];
    }
  }
  
  /**
   * Fetch market indices data
   */
  async fetchMarketIndices(): Promise<any[]> {
    try {
      return await fetchMarketIndices();
    } catch (error) {
      console.error(`Error fetching market indices:`, error);
      return [];
    }
  }
  
  /**
   * Fetch sector performance data
   */
  async fetchSectorPerformance(): Promise<any[]> {
    try {
      return await fetchSectorPerformance();
    } catch (error) {
      console.error(`Error fetching sector performance:`, error);
      return [];
    }
  }
}
