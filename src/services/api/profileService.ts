
import { invokeSupabaseFunction } from "./core/edgeFunctions";
import { withRetry } from "./core/retryStrategy";
import { StockProfile, StockQuote } from "@/types";

/**
 * Fetch company profile data
 */
export const fetchStockProfile = async (symbol: string): Promise<StockProfile | null> => {
  try {
    console.log(`Fetching stock profile for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<StockProfile>('get-stock-data', {
        symbol,
        endpoint: 'profile'
      })
    );
    
    if (!data) {
      console.warn(`No profile data found for ${symbol}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching stock profile for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch company quote data
 */
export const fetchStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    console.log(`Fetching stock quote for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<StockQuote>('get-stock-data', {
        symbol,
        endpoint: 'quote'
      })
    );
    
    if (!data) {
      console.warn(`No quote data found for ${symbol}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch company peers
 */
export const fetchCompanyPeers = async (symbol: string): Promise<string[]> => {
  try {
    console.log(`Fetching company peers for ${symbol}`);
    
    const data = await withRetry(() => 
      invokeSupabaseFunction<string[]>('get-stock-data', {
        symbol,
        endpoint: 'peers'
      })
    );
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No peers found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching company peers for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch stock rating
 */
export const fetchStockRating = async (symbol: string): Promise<{ rating: string, score: number } | null> => {
  try {
    console.log(`Fetching stock rating for ${symbol}`);
    
    const data = await invokeSupabaseFunction<{ rating: string, score: number }>('get-stock-data', {
      symbol,
      endpoint: 'rating'
    });
    
    if (!data || !data.rating) {
      console.warn(`No rating data found for ${symbol}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching stock rating for ${symbol}:`, error);
    return null;
  }
};
