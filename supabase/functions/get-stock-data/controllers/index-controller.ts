import { BaseController } from "./base-controller.ts";

const POLYGON_API_KEY = Deno.env.get("POLYGON_API_KEY") || "";

interface PolygonIndexResponse {
  request_id: string;
  results: {
    ticker: string;
    last_updated: number;
    market_status: string;
    name: string;
    session: {
      change: number;
      change_percent: number;
      close: number;
      high: number;
      low: number;
      open: number;
      previous_close: number;
    };
    value: number;
    type: string;
  }[];
  status: string;
}

export class IndexController extends BaseController {
  private readonly INDICES = {
    americas: ["I:DJI", "I:SPX", "I:COMP", "I:RUT", "I:VIX"],
    europe: ["I:FTSE", "I:FCHI", "I:GDAXI", "I:STOXX50E", "I:STOXX"],
    asia: ["I:N225", "I:HSI", "I:AXJO", "I:KS11", "I:BSESN"]
  };

  /**
   * Fetch market indices data from Polygon API
   */
  async fetchMarketIndices(): Promise<any[]> {
    try {
      const regions = ['americas', 'europe', 'asia'] as const;
      const results = [];

      for (const region of regions) {
        const tickers = this.INDICES[region].join(',');
        const url = `https://api.polygon.io/v3/snapshot/indices?ticker.any_of=${tickers}&apiKey=${POLYGON_API_KEY}`;
        
        console.log(`Fetching ${region} indices...`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Polygon API error: ${response.status}`);
        }

        const data = await response.json() as PolygonIndexResponse;
        
        // Transform data to match our expected format
        const indices = data.results.map(result => ({
          symbol: result.ticker,
          name: result.name.replace('Index', '').trim(),
          price: result.value,
          change: result.session.change,
          changePercent: result.session.change_percent
        }));

        results.push({
          name: region.charAt(0).toUpperCase() + region.slice(1),
          indices
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching market indices from Polygon:", error);
      return this.getFallbackMarketIndices();
    }
  }

  /**
   * Fallback mock data for market indices
   */
  private getFallbackMarketIndices() {
    return [
      {
        name: "Americas",
        indices: [
          { symbol: "I:SPX", name: "S&P 500", price: 5000.40, change: 23.5, changePercent: 0.47 },
          { symbol: "I:DJI", name: "Dow Jones", price: 38750.25, change: 145.70, changePercent: 0.38 },
          { symbol: "I:COMP", name: "Nasdaq", price: 15678.92, change: 89.30, changePercent: 0.57 },
          { symbol: "I:RUT", name: "Russell 2000", price: 2089.34, change: 12.45, changePercent: 0.60 },
          { symbol: "I:VIX", name: "VIX", price: 14.25, change: -0.45, changePercent: -3.06 }
        ]
      },
      {
        name: "Europe",
        indices: [
          { symbol: "I:FTSE", name: "FTSE 100", price: 7600.20, change: 42.1, changePercent: 0.56 },
          { symbol: "I:FCHI", name: "CAC 40", price: 7150.75, change: 35.2, changePercent: 0.49 },
          { symbol: "I:GDAXI", name: "DAX", price: 16800.50, change: 60.8, changePercent: 0.36 },
          { symbol: "I:STOXX50E", name: "Euro Stoxx 50", price: 4600.30, change: 22.7, changePercent: 0.50 },
          { symbol: "I:STOXX", name: "STOXX 600", price: 450.60, change: 2.1, changePercent: 0.47 }
        ]
      },
      {
        name: "Asia",
        indices: [
          { symbol: "I:N225", name: "Nikkei 225", price: 39200.80, change: 320.5, changePercent: 0.82 },
          { symbol: "I:HSI", name: "Hang Seng", price: 17200.30, change: 140.2, changePercent: 0.82 },
          { symbol: "I:AXJO", name: "S&P/ASX 200", price: 7700.40, change: 45.3, changePercent: 0.59 },
          { symbol: "I:KS11", name: "KOSPI", price: 2650.20, change: 20.1, changePercent: 0.76 },
          { symbol: "I:BSESN", name: "BSE SENSEX", price: 72000.50, change: 280.4, changePercent: 0.39 }
        ]
      }
    ];
  }

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
