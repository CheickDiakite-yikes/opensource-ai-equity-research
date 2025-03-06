
import { invokeSupabaseFunction } from "../core/edgeFunctions";
import { withRetry } from "../core/retryStrategy";
import { NewsArticle } from "@/types/news/newsTypes";

/**
 * Fetch news for a specific company
 */
export const fetchCompanyNews = async (
  symbol: string,
  limit: number = 10
): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching news for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<NewsArticle[]>('get-finnhub-news', {
        symbol,
        limit
      })
    );
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No news found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch general market news
 */
export const fetchMarketNews = async (
  category: string = 'general',
  limit: number = 10
): Promise<NewsArticle[]> => {
  try {
    console.log(`Fetching market news for category ${category}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<NewsArticle[]>('get-finnhub-news', {
        category,
        limit
      })
    );
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No news found for category ${category}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching market news:`, error);
    return [];
  }
};
