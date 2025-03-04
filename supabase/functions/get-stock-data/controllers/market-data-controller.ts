
import { makeApiRequest, buildFmpUrl } from "../../_shared/api-utils.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

export class MarketDataController {
  /**
   * Handle requests for market data
   */
  async handleRequest(endpoint: string, symbol: string): Promise<any> {
    switch (endpoint) {
      case "historical-price":
        return await this.fetchHistoricalPrice(symbol);
      case "news":
        return await this.fetchNews(symbol);
      case "peers":
        return await this.fetchPeers(symbol);
      default:
        throw new Error(`Unsupported market data endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch historical price data
   */
  async fetchHistoricalPrice(symbol: string): Promise<any> {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical price from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error (${response.status}): Unable to fetch historical price data for ${symbol}`);
      }
      
      const data = await response.json();
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
      const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${FMP_API_KEY}`;
      console.log(`Fetching news from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`News data fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `https://financialmodelingprep.com/api/v3/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching peers from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Peers data fetch failed with status ${response.status}`);
        return [{ peersList: [] }];
      }
      
      const data = await response.json();
      return data.length > 0 ? data : [{ peersList: [] }];
    } catch (error) {
      console.error(`Error fetching peers for ${symbol}:`, error);
      return [{ peersList: [] }];
    }
  }
}
