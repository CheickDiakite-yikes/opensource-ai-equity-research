
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
 * Fetch market news from Finnhub API (press releases endpoint)
 */
export const fetchMarketNews = async (limit: number = 6, symbol: string = 'AAPL'): Promise<MarketNewsArticle[]> => {
  try {
    console.log(`Fetching market news press releases for symbol: ${symbol}, limit: ${limit}`);
    
    const response = await fetch('https://rnpcygrrxeeqphdjuesh.supabase.co/functions/v1/get-finnhub-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        symbol,
        limit
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch market news (${response.status}): ${errorText}`);
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
        .map((item: any) => {
          // Validate URL before mapping
          if (!item.url || (!item.url.startsWith('http://') && !item.url.startsWith('https://'))) {
            console.warn("Article with invalid URL:", item);
            // Fix URL if possible
            if (item.url && !item.url.startsWith('http')) {
              item.url = `https://${item.url}`;
            }
          }
          
          return {
            ...item,
            // Add compatibility fields for existing components if not already present
            publishedDate: item.publishedDate || new Date(item.datetime * 1000).toISOString().split('T')[0],
            title: item.title || item.headline,
            text: item.text || item.summary,
            site: item.site || item.source
          };
        })
        .filter((item: any) => {
          // Filter out items with invalid URLs
          return item.url && 
                 (item.url.startsWith('http://') || item.url.startsWith('https://')) &&
                 item.url !== 'http://' && 
                 item.url !== 'https://';
        });
      
      if (mappedNews.length > 0) {
        console.log("Mapped news items count:", mappedNews.length);
        console.log("First news item URL:", mappedNews[0].url);
        return mappedNews;
      }
    }
    
    console.warn("No news articles found or invalid response format. Falling back to mock market news data");
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
      headline: "Fed's Powell Signals Continued Caution on Interest Rates",
      id: 1001,
      image: "https://image.cnbcfm.com/api/v1/image/107226049-1682006362846-gettyimages-1251742429-FEDERAL_RESERVE.jpeg",
      related: "",
      source: "CNBC",
      summary: "Washington, DC - Federal Reserve Chair Jerome Powell indicated that the central bank will maintain a cautious approach to interest rate changes, citing ongoing economic uncertainties.",
      url: "https://www.cnbc.com/2025/02/03/fed-powell-signals-continued-caution-on-interest-rates",
      publishedDate: "2025-02-03",
      title: "Fed's Powell Signals Continued Caution on Interest Rates",
      text: "Washington, DC - Federal Reserve Chair Jerome Powell indicated that the central bank will maintain a cautious approach to interest rate changes, citing ongoing economic uncertainties.",
      site: "CNBC"
    },
    {
      category: "business",
      datetime: 1675296000,
      headline: "Apple Announces New iPhone Features Coming in Next Update",
      id: 1002,
      image: "https://image.cnbcfm.com/api/v1/image/107207850-1678375948971-gettyimages-1247832347-porzycki-apple231.jpeg",
      related: "AAPL",
      source: "CNBC",
      summary: "Cupertino, CA - Apple Inc. today announced several new features that will be added to iPhones in the next iOS update, including enhanced privacy controls and improved battery management.",
      url: "https://www.cnbc.com/2025/03/01/apple-announces-new-iphone-features",
      publishedDate: "2025-03-01",
      title: "Apple Announces New iPhone Features Coming in Next Update",
      text: "Cupertino, CA - Apple Inc. today announced several new features that will be added to iPhones in the next iOS update, including enhanced privacy controls and improved battery management.",
      site: "CNBC",
      symbol: "AAPL"
    },
    {
      category: "technology",
      datetime: 1675299600,
      headline: "Microsoft Cloud Revenue Surges in Latest Quarter",
      id: 1003,
      image: "https://image.cnbcfm.com/api/v1/image/107206126-1678202164011-gettyimages-1247852397-MICROSOFT_EARNINGS.jpeg",
      related: "MSFT",
      source: "CNBC",
      summary: "Redmond, WA - Microsoft Corporation reported that its cloud services revenue increased by 35% in the most recent fiscal quarter, driven by strong demand for Azure and Microsoft 365.",
      url: "https://www.cnbc.com/2025/03/01/microsoft-cloud-revenue-surges",
      publishedDate: "2025-03-01",
      title: "Microsoft Cloud Revenue Surges in Latest Quarter",
      text: "Redmond, WA - Microsoft Corporation reported that its cloud services revenue increased by 35% in the most recent fiscal quarter, driven by strong demand for Azure and Microsoft 365.",
      site: "CNBC",
      symbol: "MSFT"
    },
    {
      category: "technology",
      datetime: 1675353600,
      headline: "Google Announces New AI-Powered Search Features",
      id: 1004,
      image: "https://image.cnbcfm.com/api/v1/image/107240207-1683816242469-gettyimages-1258688601-AFP_33D87YA.jpeg",
      related: "GOOGL",
      source: "CNBC",
      summary: "Mountain View, CA - Google unveiled several new AI-powered features for its search engine, aimed at providing more relevant and contextualized results for complex queries.",
      url: "https://www.cnbc.com/2025/02/28/google-announces-new-ai-search-features",
      publishedDate: "2025-02-28",
      title: "Google Announces New AI-Powered Search Features",
      text: "Mountain View, CA - Google unveiled several new AI-powered features for its search engine, aimed at providing more relevant and contextualized results for complex queries.",
      site: "CNBC",
      symbol: "GOOGL"
    },
    {
      category: "business",
      datetime: 1675425600,
      headline: "Tesla Opens New Gigafactory in Asia",
      id: 1005,
      image: "https://image.cnbcfm.com/api/v1/image/107215222-1679394492949-gettyimages-1248326384-AFP_33DQ3JY.jpeg",
      related: "TSLA",
      source: "Bloomberg",
      summary: "Shanghai - Tesla Inc. officially opened its newest Gigafactory in Asia, which is expected to significantly boost the company's production capacity for electric vehicles in the region.",
      url: "https://www.bloomberg.com/news/articles/2025-03-02/tesla-opens-new-gigafactory-in-asia",
      publishedDate: "2025-03-02",
      title: "Tesla Opens New Gigafactory in Asia",
      text: "Shanghai - Tesla Inc. officially opened its newest Gigafactory in Asia, which is expected to significantly boost the company's production capacity for electric vehicles in the region.",
      site: "Bloomberg",
      symbol: "TSLA"
    },
    {
      category: "general",
      datetime: 1675512000,
      headline: "Wall Street Rallies as Inflation Fears Ease",
      id: 1006,
      image: "https://image.cnbcfm.com/api/v1/image/107140989-1666801731430-NYSE_Traders-OB_20221026-CC-PRESS-36.jpg",
      related: "",
      source: "Wall Street Journal",
      summary: "New York - Wall Street stocks rallied on Thursday as new economic data showed signs that inflation may be cooling, easing concerns about aggressive interest rate hikes by the Federal Reserve.",
      url: "https://www.wsj.com/articles/wall-street-rallies-as-inflation-fears-ease-2025-03-02/",
      publishedDate: "2025-03-02",
      title: "Wall Street Rallies as Inflation Fears Ease",
      text: "New York - Wall Street stocks rallied on Thursday as new economic data showed signs that inflation may be cooling, easing concerns about aggressive interest rate hikes by the Federal Reserve.",
      site: "Wall Street Journal"
    }
  ];
};
