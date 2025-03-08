
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

/**
 * Fetch company logo
 */
export const fetchCompanyLogo = async (symbol: string): Promise<string | null> => {
  try {
    const response = await invokeSupabaseFunction<any[]>('get-stock-data', {
      symbol,
      endpoint: 'logo'
    });
    
    if (!response || !Array.isArray(response) || response.length === 0) {
      return null;
    }
    
    return response[0]?.logoUrl || null;
  } catch (error) {
    console.error("Error fetching company logo:", error);
    return null;
  }
};

/**
 * Fetch historical price data
 */
export const fetchHistoricalPrices = async (symbol: string, days = 365) => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', {
      symbol,
      endpoint: 'historical-price',
      days
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return [];
  }
};

/**
 * Fetch company news
 */
export const fetchCompanyNews = async (symbol: string, limit = 10) => {
  try {
    const data = await invokeSupabaseFunction<any[]>('get-stock-data', {
      symbol,
      endpoint: 'company-news',
      limit
    });
    
    return data || [];
  } catch (error) {
    console.error("Error fetching company news:", error);
    return [];
  }
};

/**
 * Fetch market news (general financial news)
 */
export const fetchMarketNews = async (limit = 6, category = 'general') => {
  try {
    const data = await fetch('https://rnpcygrrxeeqphdjuesh.supabase.co/functions/v1/get-finnhub-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucGN5Z3JyeGVlcXBoZGp1ZXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MTA3MTIsImV4cCI6MjA1NjA4NjcxMn0.MP1Q_KRdViDCLJdYr_Z_i1_vAMMZgEv3_yX9MGIN0lc'
      },
      body: JSON.stringify({ 
        category,
        limit,
        minId: 0
      }),
    }).then(res => res.json());
    
    return data || [];
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
};
