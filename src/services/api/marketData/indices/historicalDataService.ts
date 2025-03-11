
import { invokeSupabaseFunction } from "../../base";
import { 
  IndexHistoricalLightData,
  IndexHistoricalFullData
} from "@/types/market/indexTypes";

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
