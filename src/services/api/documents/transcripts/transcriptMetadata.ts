
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";

/**
 * Get available transcript dates for a company
 */
export const fetchTranscriptDates = async (symbol: string): Promise<string[]> => {
  try {
    console.log(`Fetching transcript dates for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<string[]>('fetch-transcript-dates', { symbol })
    );
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No transcript dates found for ${symbol}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching transcript dates for ${symbol}:`, error);
    return [];
  }
};

/**
 * Get all available transcript symbols
 */
export const fetchAvailableTranscriptSymbols = async (): Promise<string[]> => {
  try {
    const data = await invokeSupabaseFunction<string[]>('fetch-available-transcript-symbols', {});
    
    if (!data || !Array.isArray(data)) {
      console.warn('No transcript symbols found');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching available transcript symbols:', error);
    return [];
  }
};
