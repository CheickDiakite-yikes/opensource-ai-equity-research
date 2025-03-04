import { makeApiRequest, buildFmpUrl } from "../../_shared/api-utils.ts";
import { API_BASE_URLS, FMP_API_KEY } from "../../_shared/constants.ts";

export class MarketDataController {
  /**
   * Handle requests for market data
   */
  async handleRequest(endpoint: string, symbol: string, params: any = {}): Promise<any> {
    const { from, to, date, sector, industry, exchange, short } = params;
    
    switch (endpoint) {
      case "historical-price":
        return await this.fetchHistoricalPrice(symbol);
      case "news":
        return await this.fetchNews(symbol);
      case "peers":
        return await this.fetchPeers(symbol);
      case "sector-performance":
        return await this.fetchSectorPerformance(date, exchange, sector);
      case "industry-performance":
        return await this.fetchIndustryPerformance(date, exchange, industry);
      case "historical-sector-performance":
        return await this.fetchHistoricalSectorPerformance(sector, exchange, from, to);
      case "historical-industry-performance":
        return await this.fetchHistoricalIndustryPerformance(industry, exchange, from, to);
      case "sector-pe":
        return await this.fetchSectorPE(date, exchange, sector);
      case "industry-pe":
        return await this.fetchIndustryPE(date, exchange, industry);
      case "historical-sector-pe":
        return await this.fetchHistoricalSectorPE(sector, exchange, from, to);
      case "historical-industry-pe":
        return await this.fetchHistoricalIndustryPE(industry, exchange, from, to);
      case "biggest-gainers":
        return await this.fetchBiggestGainers();
      case "biggest-losers":
        return await this.fetchBiggestLosers();
      case "most-actives":
        return await this.fetchMostActives();
      case "index-list":
        return await this.fetchIndexList();
      case "index-quote":
        return await this.fetchIndexQuote(symbol);
      case "index-quote-short":
        return await this.fetchIndexQuoteShort(symbol);
      case "batch-index-quotes":
        return await this.fetchBatchIndexQuotes(short === 'true');
      case "index-historical-eod-light":
        return await this.fetchIndexHistoricalEODLight(symbol, from, to);
      case "index-historical-eod-full":
        return await this.fetchIndexHistoricalEODFull(symbol, from, to);
      case "index-intraday-1min":
        return await this.fetchIndexIntraday1Min(symbol, from, to);
      case "index-intraday-5min":
        return await this.fetchIndexIntraday5Min(symbol, from, to);
      case "index-intraday-1hour":
        return await this.fetchIndexIntraday1Hour(symbol, from, to);
      case "sp500-constituents":
        return await this.fetchSP500Constituents();
      case "nasdaq-constituents":
        return await this.fetchNasdaqConstituents();
      case "dowjones-constituents":
        return await this.fetchDowJonesConstituents();
      default:
        throw new Error(`Unsupported market data endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Fetch historical price data
   */
  async fetchHistoricalPrice(symbol: string): Promise<any> {
    try {
      const url = `${API_BASE_URLS.FMP}/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
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
      const url = `${API_BASE_URLS.FMP}/stock_news?tickers=${symbol}&limit=10&apikey=${FMP_API_KEY}`;
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
      const url = `${API_BASE_URLS.FMP}/stock-peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
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

  /**
   * Fetch sector performance snapshot
   */
  async fetchSectorPerformance(date: string, exchange?: string, sector?: string): Promise<any[]> {
    try {
      let url = `${API_BASE_URLS.FMP_STABLE}/sector-performance-snapshot?date=${date}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (sector) {
        url += `&sector=${sector}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching sector performance from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Sector performance fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching sector performance:`, error);
      return [];
    }
  }

  /**
   * Fetch industry performance snapshot
   */
  async fetchIndustryPerformance(date: string, exchange?: string, industry?: string): Promise<any[]> {
    try {
      let url = `${API_BASE_URLS.FMP_STABLE}/industry-performance-snapshot?date=${date}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (industry) {
        url += `&industry=${industry}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching industry performance from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Industry performance fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching industry performance:`, error);
      return [];
    }
  }

  /**
   * Fetch historical sector performance
   */
  async fetchHistoricalSectorPerformance(sector: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      let url = `https://financialmodelingprep.com/stable/historical-sector-performance?sector=${sector}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical sector performance from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Historical sector performance fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching historical sector performance:`, error);
      return [];
    }
  }

  /**
   * Fetch historical industry performance
   */
  async fetchHistoricalIndustryPerformance(industry: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      let url = `https://financialmodelingprep.com/stable/historical-industry-performance?industry=${industry}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical industry performance from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Historical industry performance fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching historical industry performance:`, error);
      return [];
    }
  }

  /**
   * Fetch sector PE snapshot
   */
  async fetchSectorPE(date: string, exchange?: string, sector?: string): Promise<any[]> {
    try {
      let url = `https://financialmodelingprep.com/stable/sector-pe-snapshot?date=${date}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (sector) {
        url += `&sector=${sector}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching sector PE from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Sector PE fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching sector PE:`, error);
      return [];
    }
  }

  /**
   * Fetch industry PE snapshot
   */
  async fetchIndustryPE(date: string, exchange?: string, industry?: string): Promise<any[]> {
    try {
      let url = `https://financialmodelingprep.com/stable/industry-pe-snapshot?date=${date}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (industry) {
        url += `&industry=${industry}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching industry PE from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Industry PE fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching industry PE:`, error);
      return [];
    }
  }

  /**
   * Fetch historical sector PE
   */
  async fetchHistoricalSectorPE(sector: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      let url = `https://financialmodelingprep.com/stable/historical-sector-pe?sector=${sector}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical sector PE from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Historical sector PE fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching historical sector PE:`, error);
      return [];
    }
  }

  /**
   * Fetch historical industry PE
   */
  async fetchHistoricalIndustryPE(industry: string, exchange?: string, from?: string, to?: string): Promise<any[]> {
    try {
      let url = `https://financialmodelingprep.com/stable/historical-industry-pe?industry=${industry}`;
      
      if (exchange) {
        url += `&exchange=${exchange}`;
      }
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching historical industry PE from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Historical industry PE fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching historical industry PE:`, error);
      return [];
    }
  }

  /**
   * Fetch biggest stock gainers
   */
  async fetchBiggestGainers(): Promise<any[]> {
    try {
      const url = `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${FMP_API_KEY}`;
      console.log(`Fetching biggest gainers from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Biggest gainers fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `https://financialmodelingprep.com/stable/biggest-losers?apikey=${FMP_API_KEY}`;
      console.log(`Fetching biggest losers from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Biggest losers fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `https://financialmodelingprep.com/stable/most-actives?apikey=${FMP_API_KEY}`;
      console.log(`Fetching most actives from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Most actives fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching most actives:`, error);
      return [];
    }
  }

  /**
   * Fetch list of stock market indices
   */
  async fetchIndexList(): Promise<any[]> {
    try {
      const url = `${API_BASE_URLS.FMP_STABLE}/index-list?apikey=${FMP_API_KEY}`;
      console.log(`Fetching index list from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Index list fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `${API_BASE_URLS.FMP_STABLE}/quote?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching index quote from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Index quote fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `${API_BASE_URLS.FMP_STABLE}/quote-short?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`Fetching index short quote from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Index short quote fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `${API_BASE_URLS.FMP_STABLE}/batch-index-quotes${short ? '?short=true' : ''}${short ? '&' : '?'}apikey=${FMP_API_KEY}`;
      console.log(`Fetching batch index quotes from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Batch index quotes fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      let url = `${API_BASE_URLS.FMP_STABLE}/historical-price-eod/light?symbol=${symbol}`;
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching light EOD data from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Light EOD data fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      let url = `${API_BASE_URLS.FMP_STABLE}/historical-price-eod/full?symbol=${symbol}`;
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching full EOD data from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Full EOD data fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      let url = `${API_BASE_URLS.FMP_STABLE}/historical-chart/1min?symbol=${symbol}`;
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching 1-min intraday data from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`1-min intraday data fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      let url = `${API_BASE_URLS.FMP_STABLE}/historical-chart/5min?symbol=${symbol}`;
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching 5-min intraday data from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`5-min intraday data fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      let url = `${API_BASE_URLS.FMP_STABLE}/historical-chart/1hour?symbol=${symbol}`;
      
      if (from) {
        url += `&from=${from}`;
      }
      
      if (to) {
        url += `&to=${to}`;
      }
      
      url += `&apikey=${FMP_API_KEY}`;
      console.log(`Fetching 1-hour intraday data from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`1-hour intraday data fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `${API_BASE_URLS.FMP_STABLE}/sp500-constituent?apikey=${FMP_API_KEY}`;
      console.log(`Fetching S&P 500 constituents from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`S&P 500 constituents fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `${API_BASE_URLS.FMP_STABLE}/nasdaq-constituent?apikey=${FMP_API_KEY}`;
      console.log(`Fetching Nasdaq constituents from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Nasdaq constituents fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
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
      const url = `${API_BASE_URLS.FMP_STABLE}/dowjones-constituent?apikey=${FMP_API_KEY}`;
      console.log(`Fetching Dow Jones constituents from: ${url.replace(FMP_API_KEY, "API_KEY_HIDDEN")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Dow Jones constituents fetch failed with status ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching Dow Jones constituents:`, error);
      return [];
    }
  }
}
