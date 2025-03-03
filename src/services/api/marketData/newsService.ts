
import { invokeSupabaseFunction } from "../base";

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
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
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
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1000",
      link: "https://financialmodellingprep.com/market-news/fmp-merck-shares-plunge-8-as-weak-guidance-overshadows-strong-revenue-growth",
      author: "Davit Kirakosyan",
      site: "Financial Modeling Prep"
    },
    {
      title: "Tesla Sales in China Surge 18.3% in January Despite Overall Market Decline",
      date: "2025-03-01 08:45:00",
      content: "Tesla (NASDAQ:TSLA) delivered 71,447 vehicles in China during January, representing an 18.3% increase year-over-year despite the broader EV market seeing declining sales.",
      tickers: "NASDAQ:TSLA",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000",
      link: "https://financialmodellingprep.com/market-news/fmp-tesla-sales-in-china-surge",
      author: "Sarah Johnson",
      site: "Financial Modeling Prep"
    },
    {
      title: "Amazon Beats Q4 Expectations on Strong Cloud Growth, Shares Rise 5%",
      date: "2025-02-28 16:30:00",
      content: "Amazon (NASDAQ:AMZN) reported Q4 earnings that exceeded Wall Street expectations, with AWS revenue growing 23% year-over-year to $25.4 billion.",
      tickers: "NASDAQ:AMZN",
      image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1000",
      link: "https://financialmodellingprep.com/market-news/fmp-amazon-beats-q4-expectations",
      author: "Michael Chen",
      site: "Financial Modeling Prep"
    },
    {
      title: "Fed's Powell Signals No Rush to Cut Rates, Markets Retreat",
      date: "2025-03-01 14:15:00",
      content: "Federal Reserve Chair Jerome Powell indicated that the central bank is unlikely to begin cutting interest rates until inflation shows more consistent signs of approaching the 2% target.",
      tickers: "",
      image: "https://images.unsplash.com/photo-1611324806102-776e8c1f0dfa?q=80&w=1000",
      link: "https://financialmodellingprep.com/market-news/fmp-fed-powell-signals-no-rate-cuts",
      author: "Emily Rodriguez",
      site: "Financial Modeling Prep"
    },
    {
      title: "Microsoft Launches New AI-Powered Productivity Suite, Challenging Google",
      date: "2025-03-02 10:20:00",
      content: "Microsoft (NASDAQ:MSFT) unveiled its next-generation AI-enhanced productivity tools, directly competing with Google's Workspace and raising the stakes in the enterprise software market.",
      tickers: "NASDAQ:MSFT,NASDAQ:GOOGL",
      image: "https://images.unsplash.com/photo-1633419461553-6db182f462e5?q=80&w=1000",
      link: "https://financialmodellingprep.com/market-news/fmp-microsoft-launches-ai-productivity-suite",
      author: "Thomas Wilson",
      site: "Financial Modeling Prep"
    },
    {
      title: "Oil Prices Drop 3% as OPEC+ Considers Increasing Production",
      date: "2025-03-02 09:05:00",
      content: "Crude oil prices fell more than 3% after reports emerged that OPEC+ members are discussing a potential increase in production quotas starting in April.",
      tickers: "NYSEARCA:USO,NYSEARCA:BNO",
      image: "https://images.unsplash.com/photo-1518291315662-e7b5d7608e22?q=80&w=1000",
      link: "https://financialmodellingprep.com/market-news/fmp-oil-prices-drop-on-opec-news",
      author: "James Peterson",
      site: "Financial Modeling Prep"
    }
  ];
};
