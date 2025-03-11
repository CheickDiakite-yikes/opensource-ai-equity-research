import { BaseController } from "./base-controller.ts";
import { MarketIndex, MarketRegion } from "../types.ts";

export class IndexController extends BaseController {
  /**
   * Fetch list of indices
   */
  async fetchIndexList(): Promise<any> {
    try {
      const url = this.buildUrl(`symbol/available-indexes`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error("Error fetching index list:", error);
      return [];
    }
  }

  /**
   * Fetch stock index quote
   */
  async fetchIndexQuote(symbol: string): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`quote`, { symbol });
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching index quote for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch stock index short quote
   */
  async fetchIndexQuoteShort(symbol: string): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`quote-short`, { symbol });
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching index short quote for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch batch index quotes
   */
  async fetchBatchIndexQuotes(short: boolean = false): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = {};
      if (short) {
        params.short = "true";
      }
      
      const url = this.buildStableUrl(`batch-index-quotes`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching batch index quotes:`, error);
      return [];
    }
  }

  /**
   * Fetch light historical EOD data for index
   */
  async fetchIndexHistoricalEODLight(symbol: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { symbol };
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-price-eod/light`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching light EOD data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch full historical EOD data for index
   */
  async fetchIndexHistoricalEODFull(symbol: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { symbol };
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-price-eod/full`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching full EOD data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch 1-minute intraday data for index
   */
  async fetchIndexIntraday1Min(symbol: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { symbol };
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-chart/1min`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching 1-min intraday data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch 5-minute intraday data for index
   */
  async fetchIndexIntraday5Min(symbol: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { symbol };
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-chart/5min`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching 5-min intraday data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch 1-hour intraday data for index
   */
  async fetchIndexIntraday1Hour(symbol: string, from?: string, to?: string): Promise<any[]> {
    try {
      const params: Record<string, string | undefined> = { symbol };
      if (from) params.from = from;
      if (to) params.to = to;
      
      const url = this.buildStableUrl(`historical-chart/1hour`, params);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching 1-hour intraday data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Fetch S&P 500 constituents
   */
  async fetchSP500Constituents(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`sp500-constituent`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching S&P 500 constituents:`, error);
      return [];
    }
  }

  /**
   * Fetch Nasdaq constituents
   */
  async fetchNasdaqConstituents(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`nasdaq-constituent`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching Nasdaq constituents:`, error);
      return [];
    }
  }

  /**
   * Fetch Dow Jones constituents
   */
  async fetchDowJonesConstituents(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`dowjones-constituent`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching Dow Jones constituents:`, error);
      return [];
    }
  }

  /**
   * Get fallback market indices data when API fails
   */
  getFallbackMarketIndices(): MarketRegion[] {
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
