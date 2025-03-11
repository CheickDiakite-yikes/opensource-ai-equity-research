
import { BaseController } from "./base-controller.ts";

export class IndexController extends BaseController {
  /**
   * Fetch list of stock market indices
   */
  async fetchIndexList(): Promise<any[]> {
    try {
      const url = this.buildStableUrl(`index-list`);
      const data = await this.makeApiRequest<any[]>(url);
      return data;
    } catch (error) {
      console.error(`Error fetching index list:`, error);
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
}
