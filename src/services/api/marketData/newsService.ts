
import { invokeSupabaseFunction } from "../base";

/**
 * Market News Article type based on FMP Stock News Feed API
 */
export interface MarketNewsArticle {
  symbol?: string;
  publishedDate: string;  // "2025-02-03 23:53:40"
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
  publisher?: string;
}

/**
 * Fetch market news from FMP API using the stock-latest endpoint
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'stock-latest',  // Using the new endpoint from documentation
      limit
    });
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Map the response to match our MarketNewsArticle interface
      // Ensure dates are in a consistent format
      return result.map((item: any) => ({
        symbol: item.symbol,
        publishedDate: item.publishedDate ? item.publishedDate : new Date().toISOString().split('T').join(' ').split('.')[0],
        title: item.title,
        image: item.image,
        site: item.site,
        text: item.text,
        url: item.url,
        publisher: item.publisher
      }));
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
  // Update the mock data with consistent date formats
  return [
    {
      symbol: "MRK",
      publishedDate: "2025-03-01 09:33:00",
      title: "Merck Shares Plunge 8% as Weak Guidance Overshadows Strong Revenue Growth",
      text: "Merck & Co (NYSE:MRK) saw its stock sink over 8% in pre-market today after delivering mixed fourth-quarter results and disappointing 2025 guidance.",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-merck-shares-plunge-8-as-weak-guidance-overshadows-strong-revenue-growth",
      site: "Financial Modeling Prep",
      publisher: "Seeking Alpha"
    },
    {
      symbol: "TSLA",
      publishedDate: "2025-03-01 08:45:00",
      title: "Tesla Sales in China Surge 18.3% in January Despite Overall Market Decline",
      text: "Tesla (NASDAQ:TSLA) delivered 71,447 vehicles in China during January, representing an 18.3% increase year-over-year despite the broader EV market seeing declining sales.",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-tesla-sales-in-china-surge",
      site: "Financial Modeling Prep",
      publisher: "CleanTechnica"
    },
    {
      symbol: "AMZN",
      publishedDate: "2025-02-28 16:30:00",
      title: "Amazon Beats Q4 Expectations on Strong Cloud Growth, Shares Rise 5%",
      text: "Amazon (NASDAQ:AMZN) reported Q4 earnings that exceeded Wall Street expectations, with AWS revenue growing 23% year-over-year to $25.4 billion.",
      image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-amazon-beats-q4-expectations",
      site: "Financial Modeling Prep",
      publisher: "MarketWatch"
    },
    {
      symbol: null,
      publishedDate: "2025-03-01 14:15:00",
      title: "Fed's Powell Signals No Rush to Cut Rates, Markets Retreat",
      text: "Federal Reserve Chair Jerome Powell indicated that the central bank is unlikely to begin cutting interest rates until inflation shows more consistent signs of approaching the 2% target.",
      image: "https://images.unsplash.com/photo-1611324806102-776e8c1f0dfa?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-fed-powell-signals-no-rate-cuts",
      site: "Financial Modeling Prep",
      publisher: "Reuters"
    },
    {
      symbol: "MSFT",
      publishedDate: "2025-03-02 10:20:00",
      title: "Microsoft Launches New AI-Powered Productivity Suite, Challenging Google",
      text: "Microsoft (NASDAQ:MSFT) unveiled its next-generation AI-enhanced productivity tools, directly competing with Google's Workspace and raising the stakes in the enterprise software market.",
      image: "https://images.unsplash.com/photo-1633419461553-6db182f462e5?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-microsoft-launches-ai-productivity-suite",
      site: "Financial Modeling Prep",
      publisher: "Bloomberg"
    },
    {
      symbol: "OIL",
      publishedDate: "2025-03-02 09:05:00",
      title: "Oil Prices Drop 3% as OPEC+ Considers Increasing Production",
      text: "Crude oil prices fell more than 3% after reports emerged that OPEC+ members are discussing a potential increase in production quotas starting in April.",
      image: "https://images.unsplash.com/photo-1518291315662-e7b5d7608e22?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-oil-prices-drop-on-opec-news",
      site: "Financial Modeling Prep",
      publisher: "OilPrice.com"
    }
  ];
};
