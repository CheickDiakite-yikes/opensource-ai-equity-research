
// Re-export all market data services
export * from './marketData';

import { invokeSupabaseFunction } from "./base";
import { MarketRegion } from "./marketData/indicesService";

/**
 * Fetch market indices data from the edge function
 */
export const fetchMarketIndices = async (): Promise<MarketRegion[]> => {
  try {
    const result = await invokeSupabaseFunction<MarketRegion[]>('get-stock-data', {
      endpoint: 'market-indices'
    });
    
    return result || [];
  } catch (error) {
    console.error("Error fetching market indices:", error);
    throw error;
  }
};

/**
 * Fetch market news data
 */
export const fetchMarketNews = async (limit: number = 6): Promise<any[]> => {
  try {
    // Using general market news endpoint with a limit
    const result = await invokeSupabaseFunction<any[]>('get-stock-data', {
      endpoint: 'news',
      symbol: 'SPY,QQQ,DIA,IWM', // Use popular ETFs for market news
      limit
    });
    
    return result || [];
  } catch (error) {
    console.error("Error fetching market news:", error);
    throw error;
  }
};

/**
 * Fetch sector performance data
 */
export const fetchSectorPerformance = async (): Promise<any[]> => {
  try {
    const result = await invokeSupabaseFunction<any[]>('get-stock-data', {
      endpoint: 'sector-performance'
    });
    
    return result || [];
  } catch (error) {
    console.error("Error fetching sector performance:", error);
    throw error;
  }
};
