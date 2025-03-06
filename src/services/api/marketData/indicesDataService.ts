
import { invokeSupabaseFunction } from "../core/edgeFunctions";
import { 
  MarketIndex, 
  IndexQuote, 
  IndexShortQuote, 
  IndexHistoricalLightData,
  IndexHistoricalFullData,
  IndexIntradayData,
  IndexConstituent
} from "@/types/market/indexTypes";

/**
 * Fetch list of market indices
 */
export const fetchIndexList = async (): Promise<MarketIndex[]> => {
  try {
    const data = await invokeSupabaseFunction<MarketIndex[]>('get-stock-data', { 
      endpoint: 'index-list' 
    });
    
    if (!data || !Array.isArray(data)) return [];
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

/**
 * Fetch historical EOD light data
 */
export const fetchIndexHistoricalEODLight = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<IndexHistoricalLightData[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexHistoricalLightData[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-historical-eod-light',
      from,
      to
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error(`Error fetching historical EOD light data for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch historical EOD full data
 */
export const fetchIndexHistoricalEODFull = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<IndexHistoricalFullData[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexHistoricalFullData[]>('get-stock-data', { 
      symbol,
      endpoint: 'index-historical-eod-full',
      from,
      to
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error(`Error fetching historical EOD full data for ${symbol}:`, error);
    return [];
  }
};

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

/**
 * Fetch S&P 500 constituents
 */
export const fetchSP500Constituents = async (): Promise<IndexConstituent[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'sp500-constituents' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching S&P 500 constituents:", error);
    return [];
  }
};

/**
 * Fetch Nasdaq constituents
 */
export const fetchNasdaqConstituents = async (): Promise<IndexConstituent[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'nasdaq-constituents' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching Nasdaq constituents:", error);
    return [];
  }
};

/**
 * Fetch Dow Jones constituents
 */
export const fetchDowJonesConstituents = async (): Promise<IndexConstituent[]> => {
  try {
    const data = await invokeSupabaseFunction<IndexConstituent[]>('get-stock-data', { 
      endpoint: 'dowjones-constituents' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching Dow Jones constituents:", error);
    return [];
  }
};
