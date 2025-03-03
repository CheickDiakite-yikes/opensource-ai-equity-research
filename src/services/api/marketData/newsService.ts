
import { invokeSupabaseFunction } from "../base";
import { formatDate } from "@/lib/utils";

/**
 * Market News Article type based on FMP Stock News Sentiments RSS Feed API format
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
 * Fetch market news from FMP API using the stock-news-sentiments-rss-feed endpoint
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'stock-news-sentiments-rss-feed',
      page: 0  // Required parameter as per documentation
    });
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Map the response to match our MarketNewsArticle interface
      // Format based on the API response format shown in the documentation
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
        publisher: item.site || ""
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
 * Updated to match the format from the stock-news-sentiments-rss-feed API endpoint
 */
const getFallbackMarketNews = (): MarketNewsArticle[] => {
  return [
    {
      symbol: "MSFT",
      publishedDate: "2023-10-10T21:10:53.000Z",
      title: "No Call Of Duty On Game Pass This Year, But Diablo IV May Arrive In 2024",
      image: "https://cdn.benzinga.com/files/images/story/2023/10/10/shutterstock_2093878507_1.jpg?optimize=medium&dpr=1&auto=webp&height=800&width=1456&fit=crop",
      site: "benzinga",
      text: "Activision Blizzard Inc (NASDAQ: ATVI) outlined its plans for Xbox Game Pass in the wake of the impending Microsoft Corp (NASDAQ: MSFT) acquisition, indicating it intends to start offering its major franchises...",
      url: "https://www.benzinga.com/general/gaming/23/10/35171171/no-call-of-duty-on-game-pass-this-year-but-diablo-iv-may-arrive-in-2024",
      sentiment: "Positive",
      sentimentScore: 0.9812
    },
    {
      symbol: "TSLA",
      publishedDate: "2023-10-10T18:45:23.000Z",
      title: "Tesla Sales in China Surge 18.3% in January Despite Overall Market Decline",
      text: "Tesla (NASDAQ:TSLA) delivered 71,447 vehicles in China during January, representing an 18.3% increase year-over-year despite the broader EV market seeing declining sales.",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000",
      url: "https://www.cleantechnica.com/2023/10/10/tesla-china-sales-surge",
      site: "CleanTechnica",
      sentiment: "Positive",
      sentimentScore: 0.88
    },
    {
      symbol: "AMZN",
      publishedDate: "2023-10-09T16:30:00.000Z",
      title: "Amazon Beats Q4 Expectations on Strong Cloud Growth, Shares Rise 5%",
      text: "Amazon (NASDAQ:AMZN) reported Q4 earnings that exceeded Wall Street expectations, with AWS revenue growing 23% year-over-year to $25.4 billion.",
      image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1000",
      url: "https://www.marketwatch.com/story/amazon-q4-earnings-beat-expectations-cloud-growth-2023-10-09",
      site: "MarketWatch",
      sentiment: "Positive",
      sentimentScore: 0.91
    },
    {
      symbol: null,
      publishedDate: "2023-10-09T14:15:00.000Z",
      title: "Fed's Powell Signals No Rush to Cut Rates, Markets Retreat",
      text: "Federal Reserve Chair Jerome Powell indicated that the central bank is unlikely to begin cutting interest rates until inflation shows more consistent signs of approaching the 2% target.",
      image: "https://images.unsplash.com/photo-1611324806102-776e8c1f0dfa?q=80&w=1000",
      url: "https://www.reuters.com/markets/us/feds-powell-signals-no-rush-cut-rates-2023-10-09",
      site: "Reuters",
      sentiment: "Neutral",
      sentimentScore: 0.51
    },
    {
      symbol: "LNW",
      publishedDate: "2023-10-08T23:32:00.000Z",
      title: "Rosen Law Firm Encourages Light & Wonder, Inc. Investors to Inquire About Securities Class Action Investigation",
      image: "https://images.financialmodelingprep.com/news/rosen-law-firm-encourages-light-wonder-inc-investors-to-20250203.jpg",
      site: "PRNewswire",
      text: "NEW YORK, Oct. 8, 2023 /PRNewswire/ -- Rosen Law Firm, a global investor rights law firm, continues to investigate potential securities claims on behalf of shareholders of Light & Wonder, Inc.",
      url: "https://www.prnewswire.com/news-releases/rosen-law-firm-encourages-light--wonder-inc-investors-to-inquire-about-securities-class-action-investigation--lnw-302366877.html",
      sentiment: "Negative",
      sentimentScore: 0.32
    },
    {
      symbol: "MSFT",
      publishedDate: "2023-10-08T10:20:00.000Z",
      title: "Microsoft Launches New AI-Powered Productivity Suite, Challenging Google",
      text: "Microsoft (NASDAQ:MSFT) unveiled its next-generation AI-enhanced productivity tools, directly competing with Google's Workspace and raising the stakes in the enterprise software market.",
      image: "https://images.unsplash.com/photo-1633419461553-6db182f462e5?q=80&w=1000",
      url: "https://www.bloomberg.com/news/articles/2023-10-08/microsoft-launches-ai-productivity-suite",
      site: "Bloomberg",
      sentiment: "Positive",
      sentimentScore: 0.85
    }
  ];
};
