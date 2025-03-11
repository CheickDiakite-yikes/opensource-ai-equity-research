
// Re-export all market data services
export * from './marketData';

import { invokeSupabaseFunction } from "./base";
import { MarketRegion } from "./marketData/indicesService";

/**
 * Fetch market indices data from the edge function
 */
export const fetchMarketIndices = async (): Promise<MarketRegion[]> => {
  try {
    console.log("Fetching market indices data...");
    const result = await invokeSupabaseFunction<MarketRegion[]>('get-stock-data', {
      endpoint: 'market-indices'
    });
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn("Empty or invalid market indices data received");
      return [];
    }
    
    // Validate and sanitize the data
    const sanitizedData = result.map(region => ({
      name: region.name,
      indices: (region.indices || []).map(index => ({
        symbol: index.symbol,
        name: index.name,
        price: typeof index.price === 'number' ? index.price : parseFloat(index.price) || 0,
        change: typeof index.change === 'number' ? index.change : parseFloat(index.change) || 0,
        changePercent: typeof index.changePercent === 'number' ? index.changePercent : parseFloat(index.changePercent) || 0
      }))
    }));
    
    console.log("Market indices data fetched successfully:", sanitizedData);
    return sanitizedData;
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
    console.log(`Fetching market news with limit ${limit}...`);
    // Using general market news endpoint with a limit
    const result = await invokeSupabaseFunction<any[]>('get-stock-data', {
      endpoint: 'news',
      symbol: 'SPY,QQQ,DIA,IWM', // Use popular ETFs for market news
      limit
    });
    
    if (!result || !Array.isArray(result)) {
      console.warn("Empty or invalid market news data received");
      return [];
    }
    
    console.log("Market news fetched successfully:", result.length, "items");
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
    console.log("Fetching sector performance data...");
    const result = await invokeSupabaseFunction<any[]>('get-stock-data', {
      endpoint: 'sector-performance'
    });
    
    if (!result || !Array.isArray(result)) {
      console.warn("Empty or invalid sector performance data received");
      return [];
    }
    
    // Transform data to ensure it's in the correct format
    const transformedData = result.map(item => {
      // Check if changesPercentage is present and properly convert it
      if (item.changesPercentage) {
        const percentageStr = item.changesPercentage.replace('%', '');
        const percentageValue = parseFloat(percentageStr) / 100;
        
        return {
          date: item.date || new Date().toISOString().split('T')[0],
          sector: item.sector,
          exchange: item.exchange,
          averageChange: percentageValue
        };
      } else {
        return {
          date: item.date || new Date().toISOString().split('T')[0],
          sector: item.sector,
          exchange: item.exchange,
          averageChange: item.averageChange || 0
        };
      }
    });
    
    console.log("Sector performance data fetched successfully:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error fetching sector performance:", error);
    throw error;
  }
};
