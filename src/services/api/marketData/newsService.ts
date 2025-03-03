
import { invokeSupabaseFunction } from "../base";

/**
 * Market News Article type based on Finnhub API response
 */
export interface MarketNewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
  publishedDate?: string; // Added for compatibility with existing components
  title?: string; // Added for compatibility with existing components
  text?: string; // Added for compatibility with existing components
  site?: string; // Added for compatibility with existing components
  symbol?: string; // Added for compatibility with existing components
}

/**
 * Fetch market news from Finnhub API
 */
export const fetchMarketNews = async (limit: number = 6): Promise<MarketNewsArticle[]> => {
  try {
    const response = await fetch('https://rnpcygrrxeeqphdjuesh.supabase.co/functions/v1/get-finnhub-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category: 'general',
        limit
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market news: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Map the Finnhub response to our MarketNewsArticle format
      const mappedNews = result
        .slice(0, limit)
        .map((item: any) => ({
          ...item,
          // Add compatibility fields for existing components
          publishedDate: new Date(item.datetime * 1000).toISOString().split('T').join(' ').split('.')[0],
          title: item.headline,
          text: item.summary,
          site: item.source
        }));
      
      if (mappedNews.length > 0) {
        console.log("Mapped news items count:", mappedNews.length);
        return mappedNews;
      }
    }
    
    console.warn("No news articles found. Falling back to mock market news data");
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
      category: "general",
      datetime: 1675209600,
      headline: "Rosen Law Firm Encourages Light & Wonder, Inc. Investors to Inquire About Securities",
      id: 1001,
      image: "https://image.cnbcfm.com/api/v1/image/106968945-1635784708411-gettyimages-1235308269-AFP_9PK6PY.jpeg",
      related: "",
      source: "CNBC",
      summary: "NEW YORK - Rosen Law Firm, a global investor rights law firm, announces an investigation of potential securities claims on behalf of shareholders of Light & Wonder, Inc.",
      url: "https://www.cnbc.com/2025/02/03/rosen-law-firm-encourages-light--wonder-inc-investors-to-inquire-about-securities",
      publishedDate: "2025-02-03 23:32:00",
      title: "Rosen Law Firm Encourages Light & Wonder, Inc. Investors to Inquire About Securities",
      text: "NEW YORK - Rosen Law Firm, a global investor rights law firm, announces an investigation of potential securities claims on behalf of shareholders of Light & Wonder, Inc.",
      site: "CNBC",
      symbol: "LNW"
    },
    {
      category: "business",
      datetime: 1675296000,
      headline: "Apple Announces New iPhone Features Coming in Next Update",
      id: 1002,
      image: "https://image.cnbcfm.com/api/v1/image/107207850-1678375948971-gettyimages-1247832347-porzycki-apple231.jpeg",
      related: "AAPL",
      source: "Business Wire",
      summary: "Cupertino, CA - Apple Inc. today announced several new features that will be added to iPhones in the next iOS update, including enhanced privacy controls and improved battery management.",
      url: "https://www.businesswire.com/news/home/20250301005001/en/Apple-Announces-New-iPhone-Features",
      publishedDate: "2025-03-01 09:33:00",
      title: "Apple Announces New iPhone Features Coming in Next Update",
      text: "Cupertino, CA - Apple Inc. today announced several new features that will be added to iPhones in the next iOS update, including enhanced privacy controls and improved battery management.",
      site: "Business Wire",
      symbol: "AAPL"
    },
    {
      category: "technology",
      datetime: 1675299600,
      headline: "Microsoft Cloud Revenue Surges in Latest Quarter",
      id: 1003,
      image: "https://image.cnbcfm.com/api/v1/image/107206126-1678202164011-gettyimages-1247852397-MICROSOFT_EARNINGS.jpeg",
      related: "MSFT",
      source: "Reuters",
      summary: "Redmond, WA - Microsoft Corporation reported that its cloud services revenue increased by 35% in the most recent fiscal quarter, driven by strong demand for Azure and Microsoft 365.",
      url: "https://www.reuters.com/business/microsoft-cloud-revenue-surges-2025-03-01/",
      publishedDate: "2025-03-01 08:45:00",
      title: "Microsoft Cloud Revenue Surges in Latest Quarter",
      text: "Redmond, WA - Microsoft Corporation reported that its cloud services revenue increased by 35% in the most recent fiscal quarter, driven by strong demand for Azure and Microsoft 365.",
      site: "Reuters",
      symbol: "MSFT"
    },
    {
      category: "technology",
      datetime: 1675353600,
      headline: "Google Announces New AI-Powered Search Features",
      id: 1004,
      image: "https://image.cnbcfm.com/api/v1/image/107240207-1683816242469-gettyimages-1258688601-AFP_33D87YA.jpeg",
      related: "GOOGL",
      source: "TechCrunch",
      summary: "Mountain View, CA - Google unveiled several new AI-powered features for its search engine, aimed at providing more relevant and contextualized results for complex queries.",
      url: "https://www.techcrunch.com/2025/02/28/google-announces-new-ai-search-features/",
      publishedDate: "2025-02-28 16:30:00",
      title: "Google Announces New AI-Powered Search Features",
      text: "Mountain View, CA - Google unveiled several new AI-powered features for its search engine, aimed at providing more relevant and contextualized results for complex queries.",
      site: "TechCrunch",
      symbol: "GOOGL"
    },
    {
      category: "business",
      datetime: 1675425600,
      headline: "Fed's Powell Signals Continued Caution on Interest Rates",
      id: 1005,
      image: "https://image.cnbcfm.com/api/v1/image/107226049-1682006362846-gettyimages-1251742429-FEDERAL_RESERVE.jpeg",
      related: "",
      source: "Wall Street Journal",
      summary: "Washington, DC - Federal Reserve Chair Jerome Powell indicated that the central bank will maintain a cautious approach to interest rate changes, citing ongoing economic uncertainties.",
      url: "https://www.wsj.com/articles/feds-powell-signals-continued-caution-on-interest-rates-2025-03-01/",
      publishedDate: "2025-03-01 14:15:00",
      title: "Fed's Powell Signals Continued Caution on Interest Rates",
      text: "Washington, DC - Federal Reserve Chair Jerome Powell indicated that the central bank will maintain a cautious approach to interest rate changes, citing ongoing economic uncertainties.",
      site: "Wall Street Journal"
    },
    {
      category: "general",
      datetime: 1675512000,
      headline: "Tesla Opens New Gigafactory in Asia",
      id: 1006,
      image: "https://image.cnbcfm.com/api/v1/image/107215222-1679394492949-gettyimages-1248326384-AFP_33DQ3JY.jpeg",
      related: "TSLA",
      source: "Bloomberg",
      summary: "Shanghai - Tesla Inc. officially opened its newest Gigafactory in Asia, which is expected to significantly boost the company's production capacity for electric vehicles in the region.",
      url: "https://www.bloomberg.com/news/articles/2025-03-02/tesla-opens-new-gigafactory-in-asia",
      publishedDate: "2025-03-02 10:20:00",
      title: "Tesla Opens New Gigafactory in Asia",
      text: "Shanghai - Tesla Inc. officially opened its newest Gigafactory in Asia, which is expected to significantly boost the company's production capacity for electric vehicles in the region.",
      site: "Bloomberg",
      symbol: "TSLA"
    }
  ];
};
