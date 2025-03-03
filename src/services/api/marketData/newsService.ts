
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
    // Directly access the financialmodelingprep API endpoint for better URL handling
    const result = await invokeSupabaseFunction<any>('get-stock-data', { 
      endpoint: 'press-releases-latest',
      limit: limit * 2, // Fetch more items to account for filtered results
      includeFullUrls: true // Signal to include complete URLs
    });
    
    if (result && Array.isArray(result)) {
      if (result.length > 0) {
        console.log("Sample market news item:", result[0]);
      }
      
      // Filter out FMP sources and map the response
      const filteredNews = result
        .filter((item: any) => {
          const source = (item.site || '').toLowerCase();
          const publisher = (item.publisher || '').toLowerCase();
          
          // Check both site and publisher fields for FMP-related terms
          return !source.includes('fmp') && 
                 !source.includes('financialmodellingprep') &&
                 !source.includes('financial modeling prep') &&
                 !source.includes('financialmodelingprep') &&
                 !publisher.includes('fmp') &&
                 !publisher.includes('financial') &&
                 !publisher.includes('modeling') &&
                 !publisher.includes('prep');
        })
        .map((item: any) => ({
          symbol: item.symbol || null,
          publishedDate: item.publishedDate || new Date().toISOString().split('T').join(' ').split('.')[0],
          title: item.title || "No title available",
          image: item.image || "",
          site: item.site || "",
          text: item.text || "No description available",
          // Ensure the URL is complete and valid
          url: ensureValidUrl(item.url),
          publisher: item.publisher || item.site
        }))
        .slice(0, limit); // Limit to requested number of items
      
      if (filteredNews.length > 0) {
        console.log("Filtered news items count:", filteredNews.length);
        return filteredNews;
      }
      
      console.warn("No suitable news articles found after filtering. Falling back to mock market news data");
      return getFallbackMarketNews();
    }
    
    console.warn("Falling back to mock market news data");
    return getFallbackMarketNews();
  } catch (error) {
    console.error("Error fetching market news:", error);
    return getFallbackMarketNews();
  }
};

/**
 * Ensures that a URL is valid and complete
 */
const ensureValidUrl = (url: string): string => {
  if (!url) return "#";
  
  // Check if the URL already starts with http:// or https://
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL or missing the protocol, add https://
  return `https://${url.startsWith('/') ? url.substring(1) : url}`;
}

/**
 * Fallback mock data for market news
 */
const getFallbackMarketNews = (): MarketNewsArticle[] => {
  // Replace all FMP sources in the mock data with more reliable sources
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
      url: "https://www.businesswire.com/news/home/20250301005001/en/Apple-Announces-New-iPhone-Features",
      site: "businesswire.com",
      publisher: "Business Wire"
    },
    {
      symbol: "MSFT",
      publishedDate: "2025-03-01 08:45:00",
      title: "Microsoft Cloud Revenue Surges in Latest Quarter",
      text: "Redmond, WA - Microsoft Corporation reported that its cloud services revenue increased by 35% in the most recent fiscal quarter, driven by strong demand for Azure and Microsoft 365.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://www.reuters.com/business/microsoft-cloud-revenue-surges-2025-03-01/",
      site: "reuters.com",
      publisher: "Reuters"
    },
    {
      symbol: "GOOGL",
      publishedDate: "2025-02-28 16:30:00",
      title: "Google Announces New AI-Powered Search Features",
      text: "Mountain View, CA - Google unveiled several new AI-powered features for its search engine, aimed at providing more relevant and contextualized results for complex queries.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://www.techcrunch.com/2025/02/28/google-announces-new-ai-search-features/",
      site: "techcrunch.com",
      publisher: "TechCrunch"
    },
    {
      symbol: null,
      publishedDate: "2025-03-01 14:15:00",
      title: "Fed's Powell Signals Continued Caution on Interest Rates",
      text: "Washington, DC - Federal Reserve Chair Jerome Powell indicated that the central bank will maintain a cautious approach to interest rate changes, citing ongoing economic uncertainties.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://www.wsj.com/articles/feds-powell-signals-continued-caution-on-interest-rates-2025-03-01/",
      site: "wsj.com",
      publisher: "Wall Street Journal"
    },
    {
      symbol: "TSLA",
      publishedDate: "2025-03-02 10:20:00",
      title: "Tesla Opens New Gigafactory in Asia",
      text: "Shanghai - Tesla Inc. officially opened its newest Gigafactory in Asia, which is expected to significantly boost the company's production capacity for electric vehicles in the region.",
      image: "https://images.financialmodellingprep.com/news-images/default-news.jpg",
      url: "https://www.bloomberg.com/news/articles/2025-03-02/tesla-opens-new-gigafactory-in-asia",
      site: "bloomberg.com",
      publisher: "Bloomberg"
    }
  ];
};
