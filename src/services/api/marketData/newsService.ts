
import { invokeSupabaseFunction } from "../base";
import { formatDate } from "@/lib/utils";

/**
 * Market News Article type based on FMP Stock News API format
 */
export interface MarketNewsArticle {
  symbol?: string | null;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
  sentiment?: string;
  sentimentScore?: number;
  publisher?: string;
}

/**
 * Fetch latest market news from FMP API using the stock-news-latest endpoint
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    // Use the stock-latest endpoint as shown in the documentation
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'stock-news-latest',
      page: 0  // Required parameter as per documentation
    });
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Map the response to match our MarketNewsArticle interface
      const articles = result.map((item: any) => ({
        symbol: item.symbol || null,
        publishedDate: item.publishedDate || new Date().toISOString(),
        title: item.title || "No title available",
        image: item.image || "",
        site: item.site || "",
        text: item.text || "No content available",
        url: item.url || "",
        sentiment: item.sentiment || null,
        sentimentScore: item.sentimentScore ? parseFloat(item.sentimentScore) : null,
        publisher: item.publisher || item.site || ""
      }));

      // Only return valid articles up to the requested limit
      return articles
        .filter(isValidArticle)
        .slice(0, limit);
    }
    
    console.warn("Falling back to mock market news data");
    return getFallbackMarketNews();
  } catch (error) {
    console.error("Error fetching market news:", error);
    return getFallbackMarketNews();
  }
};

/**
 * Validate that an article has all required fields with reasonable values
 */
function isValidArticle(article: MarketNewsArticle): boolean {
  // Check if essential fields exist and are not empty
  if (!article.title || !article.publishedDate || !article.text) {
    return false;
  }
  
  // Validate URL format
  if (article.url) {
    try {
      new URL(article.url);
    } catch (e) {
      console.warn(`Invalid URL in article: ${article.title}`);
      return false;
    }
  } else {
    return false;
  }
  
  // Validate image URL if present
  if (article.image) {
    try {
      new URL(article.image);
    } catch (e) {
      // Don't reject the article if image URL is invalid, just log it
      console.warn(`Invalid image URL in article: ${article.title}`);
      article.image = ""; // Clear the invalid image URL
    }
  }
  
  return true;
}

/**
 * Fallback mock data for market news
 * Updated to match the format from the stock-news-latest API endpoint
 * with current 2025 dates
 */
const getFallbackMarketNews = (): MarketNewsArticle[] => {
  return [
    {
      symbol: "INSG",
      publishedDate: "2025-03-03T23:53:40.000Z",
      title: "Q4 Earnings Release Looms For Inseego, But Don't Expect Miracles",
      image: "https://images.financialmodelingprep.com/news/q4-earnings-release-looms-for-inseego-but-dont-expect-20250303.jpg",
      site: "seekingalpha.com",
      text: "Inseego's Q3 beat was largely due to a one-time debt restructuring gain, not sustainable earnings growth, raising concerns about future performance. The sale of its telematics business...",
      url: "https://seekingalpha.com/article/4754485-inseego-stock-q4-earnings-preview-monitor-growth-margins-closely",
      publisher: "Seeking Alpha",
      sentiment: "Neutral",
      sentimentScore: 0.51
    },
    {
      symbol: "TSLA",
      publishedDate: "2025-03-03T18:45:23.000Z",
      title: "Tesla Sales in China Surge 18.3% in March Despite Overall Market Decline",
      text: "Tesla (NASDAQ:TSLA) delivered 71,447 vehicles in China during March, representing an 18.3% increase year-over-year despite the broader EV market seeing declining sales.",
      image: "https://images.financialmodelingprep.com/news/tesla-china-sales-surge-20250303.jpg",
      url: "https://www.cleantechnica.com/2025/03/03/tesla-china-sales-surge",
      site: "CleanTechnica",
      publisher: "CleanTechnica",
      sentiment: "Positive",
      sentimentScore: 0.88
    },
    {
      symbol: "AMZN",
      publishedDate: "2025-03-02T16:30:00.000Z",
      title: "Amazon Beats Q1 Expectations on Strong Cloud Growth, Shares Rise 5%",
      text: "Amazon (NASDAQ:AMZN) reported Q1 earnings that exceeded Wall Street expectations, with AWS revenue growing 23% year-over-year to $25.4 billion.",
      image: "https://images.financialmodelingprep.com/news/amazon-q1-earnings-beat-expectations-cloud-growth-20250302.jpg",
      url: "https://www.marketwatch.com/story/amazon-q1-earnings-beat-expectations-cloud-growth-2025-03-02",
      site: "MarketWatch",
      publisher: "MarketWatch",
      sentiment: "Positive",
      sentimentScore: 0.91
    },
    {
      symbol: null,
      publishedDate: "2025-03-02T14:15:00.000Z",
      title: "Fed's Powell Signals No Rush to Cut Rates, Markets Retreat",
      text: "Federal Reserve Chair Jerome Powell indicated that the central bank is unlikely to begin cutting interest rates until inflation shows more consistent signs of approaching the 2% target.",
      image: "https://images.financialmodelingprep.com/news/fed-powell-no-rush-to-cut-rates-20250302.jpg",
      url: "https://www.reuters.com/markets/us/feds-powell-signals-no-rush-cut-rates-2025-03-02",
      site: "Reuters",
      publisher: "Reuters",
      sentiment: "Neutral",
      sentimentScore: 0.51
    },
    {
      symbol: "LNW",
      publishedDate: "2025-03-01T23:32:00.000Z",
      title: "Rosen Law Firm Encourages Light & Wonder, Inc. Investors to Inquire About Securities Class Action Investigation",
      image: "https://images.financialmodelingprep.com/news/rosen-law-firm-encourages-light-wonder-inc-investors-to-20250301.jpg",
      site: "PRNewswire",
      text: "NEW YORK, March 1, 2025 /PRNewswire/ -- Rosen Law Firm, a global investor rights law firm, continues to investigate potential securities claims on behalf of shareholders of Light & Wonder, Inc.",
      url: "https://www.prnewswire.com/news-releases/rosen-law-firm-encourages-light--wonder-inc-investors-to-inquire-about-securities-class-action-investigation--lnw-302366877.html",
      publisher: "PRNewswire",
      sentiment: "Negative",
      sentimentScore: 0.32
    },
    {
      symbol: "MSFT",
      publishedDate: "2025-03-01T10:20:00.000Z",
      title: "Microsoft Launches New AI-Powered Productivity Suite, Challenging Google",
      text: "Microsoft (NASDAQ:MSFT) unveiled its next-generation AI-enhanced productivity tools, directly competing with Google's Workspace and raising the stakes in the enterprise software market.",
      image: "https://images.financialmodelingprep.com/news/microsoft-launches-ai-productivity-suite-20250301.jpg",
      url: "https://www.bloomberg.com/news/articles/2025-03-01/microsoft-launches-ai-productivity-suite",
      site: "Bloomberg",
      publisher: "Bloomberg",
      sentiment: "Positive",
      sentimentScore: 0.85
    }
  ];
};
