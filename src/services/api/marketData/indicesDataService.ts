
import { invokeSupabaseFunction } from "../base";
import { 
  MarketIndex, 
  IndexQuote, 
  IndexShortQuote, 
  IndexHistoricalLightData,
  IndexHistoricalFullData,
  IndexIntradayData,
  IndexConstituent
} from "@/types/apiTypes";
import { STOCK_INDICES } from "@/constants";

/**
 * Fetch a list of all available market indices
 */
export const fetchMarketIndicesList = async (): Promise<MarketIndex[]> => {
  try {
    const result = await invokeSupabaseFunction<MarketIndex[]>('get-stock-data', { 
      endpoint: 'index-list' 
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error("Invalid response format from index-list endpoint");
    return [];
  } catch (error) {
    console.error("Error fetching market indices list:", error);
    return [];
  }
};

/**
 * Fetch detailed quote data for a specific market index
 */
export const fetchIndexQuote = async (symbol: string): Promise<IndexQuote | null> => {
  try {
    const result = await invokeSupabaseFunction<IndexQuote[]>('get-stock-data', { 
      endpoint: 'index-quote',
      symbol
    });
    
    if (result && Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    
    console.error(`No quote data found for index ${symbol}`);
    return null;
  } catch (error) {
    console.error(`Error fetching quote for index ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch short quote data for a specific market index
 */
export const fetchIndexShortQuote = async (symbol: string): Promise<IndexShortQuote | null> => {
  try {
    const result = await invokeSupabaseFunction<IndexShortQuote[]>('get-stock-data', { 
      endpoint: 'index-quote-short',
      symbol
    });
    
    if (result && Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    
    console.error(`No short quote data found for index ${symbol}`);
    return null;
  } catch (error) {
    console.error(`Error fetching short quote for index ${symbol}:`, error);
    return null;
  }
};

/**
 * Fetch quotes for all available market indices
 */
export const fetchAllIndexQuotes = async (short: boolean = false): Promise<IndexShortQuote[]> => {
  try {
    const result = await invokeSupabaseFunction<IndexShortQuote[]>('get-stock-data', { 
      endpoint: 'batch-index-quotes',
      short: short ? 'true' : 'false'
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error("Invalid response format from batch-index-quotes endpoint");
    return [];
  } catch (error) {
    console.error("Error fetching all index quotes:", error);
    return [];
  }
};

/**
 * Fetch light historical EOD data for a market index
 */
export const fetchIndexHistoricalLight = async (
  symbol: string, 
  from?: string, 
  to?: string
): Promise<IndexHistoricalLightData[]> => {
  try {
    const result = await invokeSupabaseFunction<IndexHistoricalLightData[]>('get-stock-data', { 
      endpoint: 'index-historical-eod-light',
      symbol,
      from,
      to
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error(`No light historical data found for index ${symbol}`);
    return [];
  } catch (error) {
    console.error(`Error fetching light historical data for index ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch full historical EOD data for a market index
 */
export const fetchIndexHistoricalFull = async (
  symbol: string, 
  from?: string, 
  to?: string
): Promise<IndexHistoricalFullData[]> => {
  try {
    const result = await invokeSupabaseFunction<IndexHistoricalFullData[]>('get-stock-data', { 
      endpoint: 'index-historical-eod-full',
      symbol,
      from,
      to
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error(`No full historical data found for index ${symbol}`);
    return [];
  } catch (error) {
    console.error(`Error fetching full historical data for index ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch intraday data for a market index at different intervals
 */
export const fetchIndexIntraday = async (
  symbol: string, 
  interval: '1min' | '5min' | '1hour',
  from?: string, 
  to?: string
): Promise<IndexIntradayData[]> => {
  try {
    const endpoint = `index-intraday-${interval}`;
    const result = await invokeSupabaseFunction<IndexIntradayData[]>('get-stock-data', { 
      endpoint,
      symbol,
      from,
      to
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error(`No ${interval} intraday data found for index ${symbol}`);
    return [];
  } catch (error) {
    console.error(`Error fetching ${interval} intraday data for index ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch S&P 500 constituent companies
 */
export const fetchSP500Constituents = async (): Promise<IndexConstituent[]> => {
  try {
    const result = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'sp500-constituents'
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error("Invalid response format from sp500-constituents endpoint");
    return [];
  } catch (error) {
    console.error("Error fetching S&P 500 constituents:", error);
    return [];
  }
};

/**
 * Fetch Nasdaq constituent companies
 */
export const fetchNasdaqConstituents = async (): Promise<IndexConstituent[]> => {
  try {
    const result = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'nasdaq-constituents'
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error("Invalid response format from nasdaq-constituents endpoint");
    return [];
  } catch (error) {
    console.error("Error fetching Nasdaq constituents:", error);
    return [];
  }
};

/**
 * Fetch Dow Jones constituent companies
 */
export const fetchDowJonesConstituents = async (): Promise<IndexConstituent[]> => {
  try {
    const result = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'dowjones-constituents'
    });
    
    if (result && Array.isArray(result)) {
      return result;
    }
    
    console.error("Invalid response format from dowjones-constituents endpoint");
    return [];
  } catch (error) {
    console.error("Error fetching Dow Jones constituents:", error);
    return [];
  }
};
