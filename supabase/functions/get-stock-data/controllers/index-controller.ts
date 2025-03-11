
import { BaseController } from "./base-controller.ts";

export class IndexController extends BaseController {
  /**
   * Fetch list of indices
   */
  async fetchIndexList() {
    try {
      const url = this.buildUrl("index/constituents/^GSPC"); // S&P 500 as default
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error("Error fetching index list:", error);
      return [];
    }
  }
  
  /**
   * Fetch index quote
   */
  async fetchIndexQuote(symbol: string) {
    try {
      const url = this.buildUrl(`quote/${symbol.replace("^", "")}`);
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching index quote for ${symbol}:`, error);
      return {};
    }
  }
  
  /**
   * Fetch index quote (short form)
   */
  async fetchIndexQuoteShort(symbol: string) {
    try {
      return await this.fetchIndexQuote(symbol);
    } catch (error) {
      console.error(`Error fetching short index quote for ${symbol}:`, error);
      return {};
    }
  }
  
  /**
   * Fetch batch index quotes
   */
  async fetchBatchIndexQuotes(shortForm: boolean = false) {
    try {
      // Common indices
      const indices = [
        "^GSPC", "^DJI", "^IXIC", "^RUT",
        "^FTSE", "^GDAXI", "^FCHI",
        "^N225", "^HSI", "^BSESN"
      ];
      
      const promises = indices.map(symbol => 
        shortForm ? this.fetchIndexQuoteShort(symbol) : this.fetchIndexQuote(symbol)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching batch index quotes:", error);
      return [];
    }
  }
  
  /**
   * Fetch historical EOD data (lightweight)
   */
  async fetchIndexHistoricalEODLight(symbol: string, from?: string, to?: string) {
    try {
      // Default to 1 year if dates not specified
      const toDate = to || new Date().toISOString().split('T')[0];
      const fromDate = from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = this.buildUrl(`stock/candle?symbol=${symbol.replace("^", "")}&resolution=D&from=${Math.floor(new Date(fromDate).getTime() / 1000)}&to=${Math.floor(new Date(toDate).getTime() / 1000)}`);
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching historical EOD light for ${symbol}:`, error);
      return { s: "no_data" };
    }
  }
  
  /**
   * Fetch historical EOD data (full)
   */
  async fetchIndexHistoricalEODFull(symbol: string, from?: string, to?: string) {
    try {
      return await this.fetchIndexHistoricalEODLight(symbol, from, to);
    } catch (error) {
      console.error(`Error fetching historical EOD full for ${symbol}:`, error);
      return { s: "no_data" };
    }
  }
  
  /**
   * Fetch intraday data (1 minute)
   */
  async fetchIndexIntraday1Min(symbol: string, from?: string, to?: string) {
    try {
      // Default to last 24 hours if dates not specified
      const toDate = to || new Date().toISOString().split('T')[0];
      const fromDate = from || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = this.buildUrl(`stock/candle?symbol=${symbol.replace("^", "")}&resolution=1&from=${Math.floor(new Date(fromDate).getTime() / 1000)}&to=${Math.floor(new Date(toDate).getTime() / 1000)}`);
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching intraday 1min for ${symbol}:`, error);
      return { s: "no_data" };
    }
  }
  
  /**
   * Fetch intraday data (5 minutes)
   */
  async fetchIndexIntraday5Min(symbol: string, from?: string, to?: string) {
    try {
      // Default to last 5 days if dates not specified
      const toDate = to || new Date().toISOString().split('T')[0];
      const fromDate = from || new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = this.buildUrl(`stock/candle?symbol=${symbol.replace("^", "")}&resolution=5&from=${Math.floor(new Date(fromDate).getTime() / 1000)}&to=${Math.floor(new Date(toDate).getTime() / 1000)}`);
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching intraday 5min for ${symbol}:`, error);
      return { s: "no_data" };
    }
  }
  
  /**
   * Fetch intraday data (1 hour)
   */
  async fetchIndexIntraday1Hour(symbol: string, from?: string, to?: string) {
    try {
      // Default to last 30 days if dates not specified
      const toDate = to || new Date().toISOString().split('T')[0];
      const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = this.buildUrl(`stock/candle?symbol=${symbol.replace("^", "")}&resolution=60&from=${Math.floor(new Date(fromDate).getTime() / 1000)}&to=${Math.floor(new Date(toDate).getTime() / 1000)}`);
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching intraday 1hour for ${symbol}:`, error);
      return { s: "no_data" };
    }
  }
  
  /**
   * Fetch S&P 500 constituents
   */
  async fetchSP500Constituents() {
    try {
      const url = this.buildUrl("index/constituents?symbol=^GSPC");
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error("Error fetching S&P 500 constituents:", error);
      return { constituents: [] };
    }
  }
  
  /**
   * Fetch Nasdaq constituents
   */
  async fetchNasdaqConstituents() {
    try {
      const url = this.buildUrl("index/constituents?symbol=^IXIC");
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error("Error fetching Nasdaq constituents:", error);
      return { constituents: [] };
    }
  }
  
  /**
   * Fetch Dow Jones constituents
   */
  async fetchDowJonesConstituents() {
    try {
      const url = this.buildUrl("index/constituents?symbol=^DJI");
      const data = await this.makeApiRequest<any>(url);
      return data;
    } catch (error) {
      console.error("Error fetching Dow Jones constituents:", error);
      return { constituents: [] };
    }
  }

  /**
   * Provide fallback market indices data
   */
  getFallbackMarketIndices() {
    return [
      {
        name: "Americas",
        indices: [
          { symbol: "^GSPC", name: "S&P 500", price: 5954.50, change: 92.75, changePercent: 1.59 },
          { symbol: "^DJI", name: "Dow 30", price: 43840.91, change: 602.20, changePercent: 1.39 },
          { symbol: "^IXIC", name: "Nasdaq", price: 18847.28, change: 302.63, changePercent: 1.63 },
          { symbol: "^RUT", name: "Russell 2000", price: 2163.07, change: 23.24, changePercent: 1.09 },
          { symbol: "^VIX", name: "VIX", price: 19.63, change: -1.50, changePercent: -7.10 }
        ]
      },
      {
        name: "Europe",
        indices: [
          { symbol: "^FTSE", name: "FTSE 100", price: 8809.74, change: 53.53, changePercent: 0.61 },
          { symbol: "^FCHI", name: "CAC 40", price: 8111.63, change: 8.92, changePercent: 0.11 },
          { symbol: "^GDAXI", name: "DAX", price: 22551.43, change: 0.00, changePercent: 0.00 },
          { symbol: "^STOXX50E", name: "Euro Stoxx 50", price: 5463.54, change: -8.74, changePercent: -0.16 },
          { symbol: "^STOXX", name: "STOXX 600", price: 523.48, change: -0.32, changePercent: -0.06 }
        ]
      },
      {
        name: "Asia",
        indices: [
          { symbol: "^N225", name: "Nikkei 225", price: 37676.02, change: 520.62, changePercent: 1.40 },
          { symbol: "^HSI", name: "Hang Seng", price: 23220.57, change: 280.40, changePercent: 1.22 },
          { symbol: "^AXJO", name: "S&P/ASX 200", price: 8224.30, change: 52.30, changePercent: 0.64 },
          { symbol: "^KS11", name: "KOSPI", price: 2532.78, change: -88.93, changePercent: -3.39 },
          { symbol: "^BSESN", name: "BSE SENSEX", price: 73289.91, change: 95.21, changePercent: 0.13 }
        ]
      }
    ];
  }
}
