
import { invokeSupabaseFunction, withRetry } from "../../base";
import { EarningsCall } from "@/types";

/**
 * Get all available transcript dates for a symbol
 */
export const fetchTranscriptDates = async (symbol: string): Promise<{date: string, quarter: string, year: string}[]> => {
  try {
    const response = await withRetry(() => 
      invokeSupabaseFunction<{dates: {date: string, quarter: string, year: string}[]}>(
        'fetch-transcript-dates', 
        { symbol }
      )
    );
    
    return response.dates || [];
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
    const response = await withRetry(() => 
      invokeSupabaseFunction<{symbols: {symbol: string, count: number}[]}>(
        'fetch-available-transcript-symbols', 
        {}
      )
    );
    
    return response.symbols || [];
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
    const response = await withRetry(() => 
      invokeSupabaseFunction<EarningsCall[]>(
        'fetch-latest-transcripts', 
        { limit }
      )
    );
    
    return response || [];
  } catch (error) {
    console.error(`Error fetching latest transcripts:`, error);
    return [];
  }
};
