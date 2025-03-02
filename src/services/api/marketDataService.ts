
import { invokeSupabaseFunction } from "./base";
import { HistoricalPriceData, NewsArticle, CompanyPeer } from "@/types";

/**
 * Fetch historical price data
 */
export const fetchHistoricalPrices = async (symbol: string): Promise<HistoricalPriceData | null> => {
  try {
    const data = await invokeSupabaseFunction<HistoricalPriceData>('get-stock-data', { 
      symbol, 
      endpoint: 'historical-price' 
    });
    
    if (!data || !data.historical || !Array.isArray(data.historical)) return null;
    return data;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return null;
  }
};

/**
 * Fetch company news
 */
export const fetchCompanyNews = async (symbol: string): Promise<NewsArticle[]> => {
  try {
    const data = await invokeSupabaseFunction<NewsArticle[]>('get-stock-data', { 
      symbol, 
      endpoint: 'news' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching company news:", error);
    return [];
  }
};

/**
 * Fetch company peers
 */
export const fetchCompanyPeers = async (symbol: string): Promise<string[]> => {
  try {
    const data = await invokeSupabaseFunction<CompanyPeer[]>('get-stock-data', { 
      symbol, 
      endpoint: 'peers' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const peerData = data[0] as CompanyPeer;
    return peerData.peersList || [];
  } catch (error) {
    console.error("Error fetching company peers:", error);
    return [];
  }
};
