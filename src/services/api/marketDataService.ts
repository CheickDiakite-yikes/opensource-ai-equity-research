
import { invokeSupabaseFunction } from "./base";
import { HistoricalPriceData, NewsArticle, CompanyPeer } from "@/types";

/**
 * Fetch historical price data
 */
export const fetchHistoricalPrices = async (symbol: string): Promise<HistoricalPriceData | null> => {
  try {
    const data = await invokeSupabaseFunction<HistoricalPriceData>('get-stock-data', { 
      symbol, 
      endpoint: 'historical-price' 
    });
    
    if (!data || !data.historical || !Array.isArray(data.historical)) return null;
    return data;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return null;
  }
};

/**
 * Fetch company news
 */
export const fetchCompanyNews = async (symbol: string): Promise<NewsArticle[]> => {
  try {
    const data = await invokeSupabaseFunction<NewsArticle[]>('get-stock-data', { 
      symbol, 
      endpoint: 'news' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching company news:", error);
    return [];
  }
};

/**
 * Fetch company peers
 */
export const fetchCompanyPeers = async (symbol: string): Promise<string[]> => {
  try {
    const data = await invokeSupabaseFunction<CompanyPeer[]>('get-stock-data', { 
      symbol, 
      endpoint: 'peers' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const peerData = data[0] as CompanyPeer;
    return peerData.peersList || [];
  } catch (error) {
    console.error("Error fetching company peers:", error);
    return [];
  }
};

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketRegion {
  name: string;
  indices: MarketIndex[];
}

/**
 * Fetch market indices data from FMP API
 */
export const fetchMarketIndices = async (): Promise<MarketRegion[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'market-indices' 
    });
    
    if (result && Array.isArray(result)) {
      return result as MarketRegion[];
    }
    
    console.warn("Falling back to mock market indices data");
    return getFallbackMarketIndices();
  } catch (error) {
    console.error("Error fetching market indices:", error);
    return getFallbackMarketIndices();
  }
};

/**
 * Fallback mock data for market indices
 */
const getFallbackMarketIndices = (): MarketRegion[] => {
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
};

/**
 * Market News Article type
 */
export interface MarketNewsArticle {
  title: string;
  date: string;
  content: string;
  tickers?: string;
  image: string;
  link: string;
  author: string;
  site: string;
}

/**
 * Fetch market news from FMP API
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'market-news',
      limit
    });
    
    if (result && Array.isArray(result)) {
      return result as MarketNewsArticle[];
    }
    
    console.warn("Falling back to mock market news data");
    return getFallbackMarketNews();
  } catch (error) {
    console.error("Error fetching market news:", error);
    return getFallbackMarketNews();
  }
};

/**
 * Fallback mock data for market news
 */
const getFallbackMarketNews = (): MarketNewsArticle[] => {
  return [
    {
      title: "Merck Shares Plunge 8% as Weak Guidance Overshadows Strong Revenue Growth",
      date: "2025-03-01 09:33:00",
      content: "Merck & Co (NYSE:MRK) saw its stock sink over 8% in pre-market today after delivering mixed fourth-quarter results and disappointing 2025 guidance.",
      tickers: "NYSE:MRK",
      image: "https://cdn.financialmodellingprep.com/images/fmp-1738679603793.jpg",
      link: "https://financialmodellingprep.com/market-news/fmp-merck-shares-plunge-8-as-weak-guidance-overshadows-strong-revenue-growth",
      author: "Davit Kirakosyan",
      site: "Financial Modeling Prep"
    },
    {
      title: "Tesla Sales in China Surge 18.3% in January Despite Overall Market Decline",
      date: "2025-03-01 08:45:00",
      content: "Tesla (NASDAQ:TSLA) delivered 71,447 vehicles in China during January, representing an 18.3% increase year-over-year despite the broader EV market seeing declining sales.",
      tickers: "NASDAQ:TSLA",
      image: "https://cdn.financialmodellingprep.com/images/fmp-1738642859103.jpg",
      link: "https://financialmodellingprep.com/market-news/fmp-tesla-sales-in-china-surge",
      author: "Sarah Johnson",
      site: "Financial Modeling Prep"
    },
    {
      title: "Amazon Beats Q4 Expectations on Strong Cloud Growth, Shares Rise 5%",
      date: "2025-02-28 16:30:00",
      content: "Amazon (NASDAQ:AMZN) reported Q4 earnings that exceeded Wall Street expectations, with AWS revenue growing 23% year-over-year to $25.4 billion.",
      tickers: "NASDAQ:AMZN",
      image: "https://cdn.financialmodellingprep.com/images/fmp-1738592034567.jpg",
      link: "https://financialmodellingprep.com/market-news/fmp-amazon-beats-q4-expectations",
      author: "Michael Chen",
      site: "Financial Modeling Prep"
    },
    {
      title: "Fed's Powell Signals No Rush to Cut Rates, Markets Retreat",
      date: "2025-03-01 14:15:00",
      content: "Federal Reserve Chair Jerome Powell indicated that the central bank is unlikely to begin cutting interest rates until inflation shows more consistent signs of approaching the 2% target.",
      tickers: "",
      image: "https://cdn.financialmodellingprep.com/images/fmp-1738583657890.jpg",
      link: "https://financialmodellingprep.com/market-news/fmp-fed-powell-signals-no-rate-cuts",
      author: "Emily Rodriguez",
      site: "Financial Modeling Prep"
    },
    {
      title: "Microsoft Launches New AI-Powered Productivity Suite, Challenging Google",
      date: "2025-03-02 10:20:00",
      content: "Microsoft (NASDAQ:MSFT) unveiled its next-generation AI-enhanced productivity tools, directly competing with Google's Workspace and raising the stakes in the enterprise software market.",
      tickers: "NASDAQ:MSFT,NASDAQ:GOOGL",
      image: "https://cdn.financialmodellingprep.com/images/fmp-1738497623456.jpg",
      link: "https://financialmodellingprep.com/market-news/fmp-microsoft-launches-ai-productivity-suite",
      author: "Thomas Wilson",
      site: "Financial Modeling Prep"
    },
    {
      title: "Oil Prices Drop 3% as OPEC+ Considers Increasing Production",
      date: "2025-03-02 09:05:00",
      content: "Crude oil prices fell more than 3% after reports emerged that OPEC+ members are discussing a potential increase in production quotas starting in April.",
      tickers: "NYSEARCA:USO,NYSEARCA:BNO",
      image: "https://cdn.financialmodellingprep.com/images/fmp-1738493087612.jpg",
      link: "https://financialmodellingprep.com/market-news/fmp-oil-prices-drop-on-opec-news",
      author: "James Peterson",
      site: "Financial Modeling Prep"
    }
  ];
};
