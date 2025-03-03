import { invokeSupabaseFunction } from "../base";
import { verifyUrlAccessibility } from "@/lib/utils";

/**
 * Market News Article type based on FMP General News API format
 */
export interface MarketNewsArticle {
  symbol?: string | null;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
  publisher?: string;
  verified?: boolean; // Track if URL has been verified
}

/**
 * Fetch market news from FMP API using the general-latest endpoint
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'general-latest',  // Using the general-latest endpoint as per documentation
      limit
    });
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Map the response to match our MarketNewsArticle interface
      const newsArticles = result.map((item: any) => ({
        symbol: item.symbol,
        publishedDate: item.publishedDate || new Date().toISOString().split('T').join(' ').split('.')[0],
        title: item.title,
        image: item.image,
        site: item.site,
        text: item.text,
        url: item.url,
        publisher: item.publisher,
        verified: false // Initially mark all as unverified
      }));
      
      // Verify URLs in parallel
      await Promise.all(
        newsArticles.map(async (article) => {
          article.verified = await verifyUrlAccessibility(article.url);
        })
      );
      
      // Log verification results
      console.log("News articles with verified URLs:", newsArticles.filter(a => a.verified).length);
      console.log("News articles with unverified URLs:", newsArticles.filter(a => !a.verified).length);
      
      return newsArticles;
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
 * Updated to match the format from the general-latest API endpoint
 */
const getFallbackMarketNews = async (): Promise<MarketNewsArticle[]> => {
  const fallbackNews = [
    {
      symbol: null,
      publishedDate: "2025-02-03 23:51:37",
      title: "Asia tech stocks rise after Trump pauses tariffs on China and Mexico",
      image: "https://images.financialmodelingprep.com/news/asia-tech-stocks-rise-after-trump-pauses-tariffs-on-20250203.jpg",
      site: "cnbc.com",
      text: "Gains in Asian tech companies were broad-based, with stocks in Japan, South Korea and Hong Kong advancing. Semiconductor players Advantest and Lasertec led gains among Japanese stocks.",
      url: "https://www.cnbc.com/2025/02/04/asia-tech-stocks-rise-after-trump-pauses-tariffs-on-china-and-mexico.html",
      publisher: "CNBC",
      verified: false
    },
    {
      symbol: "LNW",
      publishedDate: "2025-02-03 23:32:00",
      title: "Rosen Law Firm Encourages Light & Wonder, Inc. Investors to Inquire About Securities Class Action Investigation - LNW",
      image: "https://images.financialmodelingprep.com/news/rosen-law-firm-encourages-light-wonder-inc-investors-to-20250203.jpg",
      site: "prnewswire.com",
      text: "NEW YORK, Feb. 3, 2025 /PRNewswire/ -- Why: Rosen Law Firm, a global investor rights law firm, continues to investigate potential securities claims on behalf of shareholders of Light & Wonder, Inc.",
      url: "https://www.prnewswire.com/news-releases/rosen-law-firm-encourages-light--wonder-inc-investors-to-inquire-about-securities-class-action-investigation--lnw-302366877.html",
      publisher: "PRNewsWire",
      verified: false
    },
    {
      symbol: "TSLA",
      publishedDate: "2025-03-01 08:45:00",
      title: "Tesla Sales in China Surge 18.3% in January Despite Overall Market Decline",
      text: "Tesla (NASDAQ:TSLA) delivered 71,447 vehicles in China during January, representing an 18.3% increase year-over-year despite the broader EV market seeing declining sales.",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-tesla-sales-in-china-surge",
      site: "Financial Modeling Prep",
      publisher: "CleanTechnica",
      verified: false
    },
    {
      symbol: "AMZN",
      publishedDate: "2025-02-28 16:30:00",
      title: "Amazon Beats Q4 Expectations on Strong Cloud Growth, Shares Rise 5%",
      text: "Amazon (NASDAQ:AMZN) reported Q4 earnings that exceeded Wall Street expectations, with AWS revenue growing 23% year-over-year to $25.4 billion.",
      image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-amazon-beats-q4-expectations",
      site: "Financial Modeling Prep",
      publisher: "MarketWatch",
      verified: false
    },
    {
      symbol: null,
      publishedDate: "2025-03-01 14:15:00",
      title: "Fed's Powell Signals No Rush to Cut Rates, Markets Retreat",
      text: "Federal Reserve Chair Jerome Powell indicated that the central bank is unlikely to begin cutting interest rates until inflation shows more consistent signs of approaching the 2% target.",
      image: "https://images.unsplash.com/photo-1611324806102-776e8c1f0dfa?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-fed-powell-signals-no-rate-cuts",
      site: "Financial Modeling Prep",
      publisher: "Reuters",
      verified: false
    },
    {
      symbol: "MSFT",
      publishedDate: "2025-03-02 10:20:00",
      title: "Microsoft Launches New AI-Powered Productivity Suite, Challenging Google",
      text: "Microsoft (NASDAQ:MSFT) unveiled its next-generation AI-enhanced productivity tools, directly competing with Google's Workspace and raising the stakes in the enterprise software market.",
      image: "https://images.unsplash.com/photo-1633419461553-6db182f462e5?q=80&w=1000",
      url: "https://financialmodellingprep.com/market-news/fmp-microsoft-launches-ai-productivity-suite",
      site: "Financial Modeling Prep",
      publisher: "Bloomberg",
      verified: false
    }
  ];
  
  // Verify the fallback URLs as well
  await Promise.all(
    fallbackNews.map(async (article) => {
      article.verified = await verifyUrlAccessibility(article.url);
    })
  );
  
  return fallbackNews;
};
