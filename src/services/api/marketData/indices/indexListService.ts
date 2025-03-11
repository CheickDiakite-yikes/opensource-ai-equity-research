
import { invokeSupabaseFunction } from "../../base";
import { MarketIndex, IndexQuote, IndexShortQuote } from "@/types/market/indexTypes";

/**
 * Fetch list of market indices with real-time data
 */
export const fetchIndexList = async (): Promise<MarketIndex[]> => {
  try {
    console.log("Fetching real-time market indices data...");
    const data = await invokeSupabaseFunction<MarketIndex[]>('get-stock-data', { 
      endpoint: 'index-list' 
    });
    
    if (!data || !Array.isArray(data)) {
      console.warn("No market indices data received");
      return [];
    }

    // Log the data we received
    console.log(`Received data for ${data.length} indices`);
    data.forEach(index => {
      console.log(`${index.symbol}: $${index.price} (${index.changePercent}%)`);
    });

    return data;
  } catch (error) {
    console.error("Error fetching index list:", error);
    return [];
  }
};

/**
 * Fetch index quote
 */
export const fetchIndexQuote = async (symbol: string): Promise<IndexQuote | null> => {
  try {
    const data = await invokeSupabaseFunction<IndexQuote[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-quote' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error(`Error fetching index quote for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch short index quote
 */
export const fetchIndexQuoteShort = async (symbol: string): Promise<IndexShortQuote | null> => {
  try {
    const data = await invokeSupabaseFunction<IndexShortQuote[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-quote-short' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error(`Error fetching short index quote for ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch batch index quotes
 */
export const fetchBatchIndexQuotes = async (short: boolean = false): Promise<IndexShortQuote[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexShortQuote[]>('get-stock-data', { 
      endpoint: 'batch-index-quotes',
      short
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching batch index quotes:", error);
    return [];
  }
};
