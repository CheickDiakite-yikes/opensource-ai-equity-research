
import { invokeSupabaseFunction } from "../../base";
import { IndexIntradayData } from "@/types/market/indexTypes";

/**
 * Fetch intraday 1-minute data
 */
export const fetchIndexIntraday1Min = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<IndexIntradayData[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexIntradayData[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-intraday-1min',
      from,
      to
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error(`Error fetching intraday 1-minute data for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch intraday 5-minute data
 */
export const fetchIndexIntraday5Min = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<IndexIntradayData[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexIntradayData[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-intraday-5min',
      from,
      to
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error(`Error fetching intraday 5-minute data for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch intraday 1-hour data
 */
export const fetchIndexIntraday1Hour = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<IndexIntradayData[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexIntradayData[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-intraday-1hour',
      from,
      to
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error(`Error fetching intraday 1-hour data for ${symbol}:`, error);
    return [];
  }
};
