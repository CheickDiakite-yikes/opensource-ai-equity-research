import { StockDataController } from "./stock-data-controller.ts";
import { IndexController } from "./index-controller.ts";
import { SectorIndustryController } from "./sector-industry-controller.ts";
import { MarketMoversController } from "./market-movers-controller.ts";
import { FINNHUB_API_KEY, fetchFromFinnhub } from "../../_shared/finnhub-utils.ts";

export class MarketDataController {
  private stockDataController: StockDataController;
  private indexController: IndexController;
  private sectorIndustryController: SectorIndustryController;
  private marketMoversController: MarketMoversController;

  constructor() {
    this.stockDataController = new StockDataController();
    this.indexController = new IndexController();
    this.sectorIndustryController = new SectorIndustryController();
    this.marketMoversController = new MarketMoversController();
  }

  /**
   * Handle requests for market data
   */
  async handleRequest(endpoint: string, symbol: string, params: any = {}): Promise<any> {
    const { from, to, date, sector, industry, exchange, short } = params;
    
    // Stock data endpoints
    if (["historical-price", "news", "peers"].includes(endpoint)) {
      return this.handleStockDataRequest(endpoint, symbol);
    }
    
    // Index endpoints
    if (["index-list", "index-quote", "index-quote-short", "batch-index-quotes",
         "index-historical-eod-light", "index-historical-eod-full",
         "index-intraday-1min", "index-intraday-5min", "index-intraday-1hour",
         "sp500-constituents", "nasdaq-constituents", "dowjones-constituents"].includes(endpoint)) {
      return this.handleIndexRequest(endpoint, symbol, { from, to, short });
    }
    
    // Sector and industry endpoints
    if (["sector-performance", "industry-performance", 
         "historical-sector-performance", "historical-industry-performance",
         "sector-pe", "industry-pe", "historical-sector-pe", "historical-industry-pe"].includes(endpoint)) {
      return this.handleSectorIndustryRequest(endpoint, { date, sector, industry, exchange, from, to });
    }
    
    // Market movers endpoints
    if (["biggest-gainers", "biggest-losers", "most-actives"].includes(endpoint)) {
      return this.handleMarketMoversRequest(endpoint);
    }
    
    // New endpoint for market indices
    if (endpoint === "market-indices") {
      return this.fetchMarketIndices();
    }
    
    throw new Error(`Unsupported market data endpoint: ${endpoint}`);
  }
  
  /**
   * Handle stock data requests
   */
  private async handleStockDataRequest(endpoint: string, symbol: string): Promise<any> {
    switch (endpoint) {
      case "historical-price":
        return await this.stockDataController.fetchHistoricalPrice(symbol);
      case "news":
        return await this.stockDataController.fetchNews(symbol);
      case "peers":
        return await this.stockDataController.fetchPeers(symbol);
      default:
        throw new Error(`Unsupported stock data endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Handle index requests
   */
  private async handleIndexRequest(endpoint: string, symbol: string, params: { from?: string, to?: string, short?: boolean }): Promise<any> {
    const { from, to, short } = params;
    
    switch (endpoint) {
      case "index-list":
        return await this.indexController.fetchIndexList();
      case "index-quote":
        return await this.indexController.fetchIndexQuote(symbol);
      case "index-quote-short":
        return await this.indexController.fetchIndexQuoteShort(symbol);
      case "batch-index-quotes":
        return await this.indexController.fetchBatchIndexQuotes(short === true);
      case "index-historical-eod-light":
        return await this.indexController.fetchIndexHistoricalEODLight(symbol, from, to);
      case "index-historical-eod-full":
        return await this.indexController.fetchIndexHistoricalEODFull(symbol, from, to);
      case "index-intraday-1min":
        return await this.indexController.fetchIndexIntraday1Min(symbol, from, to);
      case "index-intraday-5min":
        return await this.indexController.fetchIndexIntraday5Min(symbol, from, to);
      case "index-intraday-1hour":
        return await this.indexController.fetchIndexIntraday1Hour(symbol, from, to);
      case "sp500-constituents":
        return await this.indexController.fetchSP500Constituents();
      case "nasdaq-constituents":
        return await this.indexController.fetchNasdaqConstituents();
      case "dowjones-constituents":
        return await this.indexController.fetchDowJonesConstituents();
      default:
        throw new Error(`Unsupported index endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Handle sector and industry requests
   */
  private async handleSectorIndustryRequest(endpoint: string, params: { 
    date?: string, 
    sector?: string, 
    industry?: string, 
    exchange?: string,
    from?: string,
    to?: string
  }): Promise<any> {
    const { date, sector, industry, exchange, from, to } = params;
    
    switch (endpoint) {
      case "sector-performance":
        if (!date) throw new Error("Date is required for sector performance");
        return await this.sectorIndustryController.fetchSectorPerformance(date, exchange, sector);
      case "industry-performance":
        if (!date) throw new Error("Date is required for industry performance");
        return await this.sectorIndustryController.fetchIndustryPerformance(date, exchange, industry);
      case "historical-sector-performance":
        if (!sector) throw new Error("Sector is required for historical sector performance");
        return await this.sectorIndustryController.fetchHistoricalSectorPerformance(sector, exchange, from, to);
      case "historical-industry-performance":
        if (!industry) throw new Error("Industry is required for historical industry performance");
        return await this.sectorIndustryController.fetchHistoricalIndustryPerformance(industry, exchange, from, to);
      case "sector-pe":
        if (!date) throw new Error("Date is required for sector PE");
        return await this.sectorIndustryController.fetchSectorPE(date, exchange, sector);
      case "industry-pe":
        if (!date) throw new Error("Date is required for industry PE");
        return await this.sectorIndustryController.fetchIndustryPE(date, exchange, industry);
      case "historical-sector-pe":
        if (!sector) throw new Error("Sector is required for historical sector PE");
        return await this.sectorIndustryController.fetchHistoricalSectorPE(sector, exchange, from, to);
      case "historical-industry-pe":
        if (!industry) throw new Error("Industry is required for historical industry PE");
        return await this.sectorIndustryController.fetchHistoricalIndustryPE(industry, exchange, from, to);
      default:
        throw new Error(`Unsupported sector/industry endpoint: ${endpoint}`);
    }
  }
  
  /**
   * Handle market movers requests
   */
  private async handleMarketMoversRequest(endpoint: string): Promise<any> {
    switch (endpoint) {
      case "biggest-gainers":
        return await this.marketMoversController.fetchBiggestGainers();
      case "biggest-losers":
        return await this.marketMoversController.fetchBiggestLosers();
      case "most-actives":
        return await this.marketMoversController.fetchMostActives();
      default:
        throw new Error(`Unsupported market movers endpoint: ${endpoint}`);
    }
  }

  /**
   * Fetch real-time market indices using Finnhub
   */
  private async fetchMarketIndices(): Promise<any> {
    try {
      // Common indices symbols
      const americasIndices = [
        { symbol: "^GSPC", name: "S&P 500" },
        { symbol: "^DJI", name: "Dow 30" },
        { symbol: "^IXIC", name: "Nasdaq" },
        { symbol: "^RUT", name: "Russell 2000" },
        { symbol: "^VIX", name: "VIX" }
      ];
      
      const europeIndices = [
        { symbol: "^FTSE", name: "FTSE 100" },
        { symbol: "^FCHI", name: "CAC 40" },
        { symbol: "^GDAXI", name: "DAX" },
        { symbol: "^STOXX50E", name: "Euro Stoxx 50" },
        { symbol: "^STOXX", name: "STOXX 600" }
      ];
      
      const asiaIndices = [
        { symbol: "^N225", name: "Nikkei 225" },
        { symbol: "^HSI", name: "Hang Seng" },
        { symbol: "^AXJO", name: "S&P/ASX 200" },
        { symbol: "^KS11", name: "KOSPI" },
        { symbol: "^BSESN", name: "BSE SENSEX" }
      ];
      
      // Fetch data for all indices concurrently
      const fetchIndicesData = async (indices: Array<{ symbol: string, name: string }>) => {
        return Promise.all(
          indices.map(async (index) => {
            try {
              // Finnhub requires stock symbols without ^ prefix
              const finnhubSymbol = index.symbol.replace('^', '');
              const url = `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;
              const data = await fetchFromFinnhub(url);
              
              return {
                symbol: index.symbol,
                name: index.name,
                price: data.c,
                change: data.d,
                changePercent: data.dp
              };
            } catch (error) {
              console.error(`Error fetching data for ${index.symbol}:`, error);
              // Return fallback data on error
              return {
                symbol: index.symbol,
                name: index.name,
                price: 0,
                change: 0,
                changePercent: 0
              };
            }
          })
        );
      };
      
      // Fetch data for all regions
      const [americasData, europeData, asiaData] = await Promise.all([
        fetchIndicesData(americasIndices),
        fetchIndicesData(europeIndices),
        fetchIndicesData(asiaIndices)
      ]);
      
      // Structure the data by region
      return [
        { name: "Americas", indices: americasData },
        { name: "Europe", indices: europeData },
        { name: "Asia", indices: asiaData }
      ];
    } catch (error) {
      console.error("Error fetching market indices:", error);
      // Return mock data as fallback
      return this.indexController.getFallbackMarketIndices();
    }
  }
}
