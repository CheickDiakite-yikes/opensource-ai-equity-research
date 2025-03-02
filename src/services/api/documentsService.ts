
import { invokeSupabaseFunction } from "./base";
import { EarningsCall, SECFiling } from "@/types";

/**
 * Fetch earnings call transcripts
 */
export const fetchEarningsTranscripts = async (symbol: string): Promise<EarningsCall[]> => {
  try {
    const data = await invokeSupabaseFunction<EarningsCall[]>('get-stock-data', { 
      symbol, 
      endpoint: 'earning-transcripts' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching earnings transcripts:", error);
    return [];
  }
};

/**
 * Fetch SEC filings
 */
export const fetchSECFilings = async (symbol: string): Promise<SECFiling[]> => {
  try {
    const data = await invokeSupabaseFunction<SECFiling[]>('get-stock-data', { 
      symbol, 
      endpoint: 'sec-filings' 
    });
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching SEC filings:", error);
    return [];
  }
};

/**
 * Generate highlights from earnings transcript text using OpenAI
 */
export const generateTranscriptHighlights = async (transcriptText: string): Promise<string[]> => {
  try {
    const response = await invokeSupabaseFunction<{ highlights: string[] }>('generate-transcript-highlights', { 
      transcriptText 
    });
    
    if (!response || !response.highlights) return [];
    return response.highlights;
  } catch (error) {
    console.error("Error generating transcript highlights:", error);
    return [];
  }
};
