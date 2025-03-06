
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";
import { EarningsCall } from "@/types";
import { triggerDocumentCaching } from "../base";

/**
 * Fetch earnings call transcripts for a company
 */
export const fetchEarningsTranscripts = async (symbol: string): Promise<EarningsCall[]> => {
  try {
    console.log(`Fetching earnings transcripts for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<EarningsCall[]>('fetch-earnings-transcripts', { symbol })
    );
    
    // Trigger background caching
    triggerDocumentCaching(symbol, 'transcripts');
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No transcript data found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching earnings transcripts for ${symbol}:`, error);
    return [];
  }
};

/**
 * Fetch latest available earnings call transcripts
 */
export const fetchLatestTranscripts = async (limit: number = 10): Promise<EarningsCall[]> => {
  try {
    console.log(`Fetching latest ${limit} earnings transcripts`);
    const data = await invokeSupabaseFunction<EarningsCall[]>('fetch-latest-transcripts', { limit });
    
    if (!data || !Array.isArray(data)) {
      console.warn('No latest transcript data found');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching latest earnings transcripts:', error);
    return [];
  }
};
