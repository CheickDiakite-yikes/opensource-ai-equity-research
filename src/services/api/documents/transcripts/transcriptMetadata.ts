
import { invokeSupabaseFunction, withRetry } from "../../base";
import { EarningsCall } from "@/types";

/**
 * Get all available transcript dates for a symbol
 */
export const fetchTranscriptDates = async (symbol: string): Promise<{date: string, quarter: string, year: string}[]> => {
  try {
    const { data, error } = await withRetry(async () => {
      const result = await invokeSupabaseFunction<{dates: {date: string, quarter: string, year: string}[]}>(
        'fetch-transcript-dates', 
        { symbol }
      );
      if (result.error) throw result.error;
      return result;
    });
    
    if (error) {
      console.error(`Error fetching transcript dates for ${symbol}:`, error);
      return [];
    }
    
    return data?.dates || [];
  } catch (error) {
    console.error(`Error fetching transcript dates for ${symbol}:`, error);
    return [];
  }
};

/**
 * Get all available symbols with transcripts
 */
export const fetchSymbolsWithTranscripts = async (): Promise<{symbol: string, count: number}[]> => {
  try {
    const { data, error } = await withRetry(async () => {
      const result = await invokeSupabaseFunction<{symbols: {symbol: string, count: number}[]}>(
        'fetch-available-transcript-symbols', 
        {}
      );
      if (result.error) throw result.error;
      return result;
    });
    
    if (error) {
      console.error("Error fetching available transcript symbols:", error);
      return [];
    }
    
    return data?.symbols || [];
  } catch (error) {
    console.error("Error fetching available transcript symbols:", error);
    return [];
  }
};

/**
 * Get latest earnings transcripts across all companies
 */
export const fetchLatestTranscripts = async (limit: number = 20): Promise<EarningsCall[]> => {
  try {
    const { data, error } = await withRetry(async () => {
      const result = await invokeSupabaseFunction<EarningsCall[]>(
        'fetch-latest-transcripts', 
        { limit }
      );
      if (result.error) throw result.error;
      return result;
    });
    
    if (error) {
      console.error(`Error fetching latest transcripts:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching latest transcripts:`, error);
    return [];
  }
};
