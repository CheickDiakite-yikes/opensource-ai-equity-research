
import { invokeSupabaseFunction } from "./base";
import { StockProfile, StockQuote } from "@/types";

/**
 * Fetch stock profile data
 */
export const fetchStockProfile = async (symbol: string): Promise<StockProfile | null> => {
  try {
    const data = await invokeSupabaseFunction<StockProfile[]>('get-stock-data', { 
      symbol, 
      endpoint: 'profile' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as StockProfile;
  } catch (error) {
    console.error("Error fetching stock profile:", error);
    return null;
  }
};

/**
 * Fetch stock quote data
 */
export const fetchStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const data = await invokeSupabaseFunction<StockQuote[]>('get-stock-data', { 
      symbol, 
      endpoint: 'quote' 
    });
    
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as StockQuote;
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
};
