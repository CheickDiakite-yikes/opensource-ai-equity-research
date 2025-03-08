// Market data service functions

import { invokeSupabaseFunction } from "./base";

/**
 * Fetch company peers for a given stock symbol
 */
export const fetchCompanyPeers = async (symbol: string): Promise<string[]> => {
  try {
    const response = await invokeSupabaseFunction<any[]>('get-stock-data', {
      symbol,
      endpoint: 'peers'
    });
    
    if (!response || !Array.isArray(response) || response.length === 0) {
      return [];
    }
    
    // The peers endpoint returns an object with a 'peers' array
    const peersList = response[0]?.peersList || [];
    return Array.isArray(peersList) ? peersList : [];
  } catch (error) {
    console.error("Error fetching company peers:", error);
    return [];
  }
};

/**
 * Fetch market index data
 */
export const fetchMarketIndices = async () => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-market-data', {
      endpoint: 'market-indices'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching market indices:", error);
    return [];
  }
};

/**
 * Fetch major market movers
 */
export const fetchMarketMovers = async () => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-market-data', {
      endpoint: 'market-movers'
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching market movers:", error);
    return [];
  }
};
