
import { invokeSupabaseFunction } from "../base";

/**
 * Market News Article type based on FMP Press Releases API
 */
export interface MarketNewsArticle {
  symbol?: string;
  publishedDate: string;  // "2025-02-03 23:32:00"
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
  publisher?: string;
}

/**
 * Fetch market news from FMP API using the press-releases-latest endpoint
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'press-releases-latest',
      limit
    });
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Map the response to match our MarketNewsArticle interface
      return result.map((item: any) => ({
        symbol: item.symbol || null,
        publishedDate: item.publishedDate || new Date().toISOString().split('T').join(' ').split('.')[0],
        title: item.title || "No title available",
        image: item.image || "",
        site: item.site || "",
        text: item.text || "No description available",
        url: item.url || "#",
        publisher: item.publisher || item.site
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
  return [
    {
      symbol: "LNW",
      publishedDate: "2025-02-03 23:32:00",
      title: "Rosen Law Firm Encourages Light & Wonder, Inc. Investors to Inquire About Securities",
      text: "NEW YORK, Feb. 3, 2025 /PRNewsWire/ -- Why: Rosen Law Firm, a global investor rights law firm, announces an investigation of potential securities claims on behalf of shareholders of Light & Wonder, Inc.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://www.prnewswire.com/news-releases/rosen-law-firm-encourages-light--wonder-inc-investors-to-inquire-about-securities",
      site: "prnewswire.com",
      publisher: "PRNewsWire"
    },
    {
      symbol: "AAPL",
      publishedDate: "2025-03-01 09:33:00",
      title: "Apple Announces New iPhone Features Coming in Next Update",
      text: "Cupertino, CA - Apple Inc. today announced several new features that will be added to iPhones in the next iOS update, including enhanced privacy controls and improved battery management.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://financialmodellingprep.com/market-news/fmp-apple-announces-features",
      site: "Financial Modeling Prep",
      publisher: "Business Wire"
    },
    {
      symbol: "MSFT",
      publishedDate: "2025-03-01 08:45:00",
      title: "Microsoft Cloud Revenue Surges in Latest Quarter",
      text: "Redmond, WA - Microsoft Corporation reported that its cloud services revenue increased by 35% in the most recent fiscal quarter, driven by strong demand for Azure and Microsoft 365.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://financialmodellingprep.com/market-news/fmp-microsoft-cloud-revenue",
      site: "Financial Modeling Prep",
      publisher: "Market News"
    },
    {
      symbol: "GOOGL",
      publishedDate: "2025-02-28 16:30:00",
      title: "Google Announces New AI-Powered Search Features",
      text: "Mountain View, CA - Google unveiled several new AI-powered features for its search engine, aimed at providing more relevant and contextualized results for complex queries.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://financialmodellingprep.com/market-news/fmp-google-announces-ai-search",
      site: "Financial Modeling Prep",
      publisher: "Tech Today"
    },
    {
      symbol: null,
      publishedDate: "2025-03-01 14:15:00",
      title: "Fed's Powell Signals Continued Caution on Interest Rates",
      text: "Washington, DC - Federal Reserve Chair Jerome Powell indicated that the central bank will maintain a cautious approach to interest rate changes, citing ongoing economic uncertainties.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://financialmodellingprep.com/market-news/fmp-fed-powell-signals-caution",
      site: "Financial Modeling Prep",
      publisher: "Reuters"
    },
    {
      symbol: "TSLA",
      publishedDate: "2025-03-02 10:20:00",
      title: "Tesla Opens New Gigafactory in Asia",
      text: "Shanghai - Tesla Inc. officially opened its newest Gigafactory in Asia, which is expected to significantly boost the company's production capacity for electric vehicles in the region.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://financialmodellingprep.com/market-news/fmp-tesla-opens-gigafactory",
      site: "Financial Modeling Prep",
      publisher: "Auto News"
    }
  ];
};
