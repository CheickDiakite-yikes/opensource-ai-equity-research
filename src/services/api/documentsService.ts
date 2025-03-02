
import { invokeSupabaseFunction } from "./base";
import { EarningsCall, SECFiling } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch earnings call transcripts - first from database, then from API if needed
 */
export const fetchEarningsTranscripts = async (symbol: string): Promise<EarningsCall[]> => {
  try {
    // First try to get from database
    const { data: cachedTranscripts, error } = await supabase
      .from('earnings_transcripts')
      .select('*')
      .eq('symbol', symbol)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // If we have cached data, use it
    if (cachedTranscripts && cachedTranscripts.length > 0) {
      return cachedTranscripts.map(transcript => ({
        symbol: transcript.symbol,
        quarter: transcript.quarter,
        year: transcript.year,
        date: transcript.date,
        content: transcript.content || "",
        url: transcript.url || `https://seekingalpha.com/symbol/${symbol}/earnings/transcripts`,
        highlights: transcript.highlights || []
      }));
    }
    
    // Otherwise, get from API and cache in background
    const data = await invokeSupabaseFunction<EarningsCall[]>('get-stock-data', { 
      symbol, 
      endpoint: 'earning-transcripts' 
    });
    
    // Trigger background caching process
    triggerDocumentCaching(symbol, 'transcripts');
    
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching earnings transcripts:", error);
    return [];
  }
};

/**
 * Fetch SEC filings - first from database, then from API if needed
 */
export const fetchSECFilings = async (symbol: string): Promise<SECFiling[]> => {
  try {
    // First try to get from database
    const { data: cachedFilings, error } = await supabase
      .from('sec_filings')
      .select('*')
      .eq('symbol', symbol)
      .order('filing_date', { ascending: false });
    
    if (error) throw error;
    
    // If we have cached data, use it
    if (cachedFilings && cachedFilings.length > 0) {
      return cachedFilings.map(filing => ({
        symbol: filing.symbol,
        type: filing.type,
        filingDate: filing.filing_date,
        reportDate: filing.report_date || filing.filing_date,
        cik: filing.cik || "0000000000",
        form: filing.form,
        url: filing.url || `https://www.sec.gov/edgar/search/#/entityName=${symbol}`,
        filingNumber: filing.filing_number || "000-00000"
      }));
    }
    
    // Otherwise, get from API and cache in background
    const data = await invokeSupabaseFunction<SECFiling[]>('get-stock-data', { 
      symbol, 
      endpoint: 'sec-filings' 
    });
    
    // Trigger background caching process
    triggerDocumentCaching(symbol, 'filings');
    
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
export const generateTranscriptHighlights = async (
  transcriptText: string,
  metadata?: { symbol: string; quarter: string; year: string; date: string }
): Promise<string[]> => {
  try {
    const payload: any = { transcriptText };
    
    // Include metadata if available for caching
    if (metadata) {
      payload.symbol = metadata.symbol;
      payload.quarter = metadata.quarter;
      payload.year = metadata.year;
      payload.date = metadata.date;
    }
    
    const response = await invokeSupabaseFunction<{ highlights: string[] }>('generate-transcript-highlights', payload);
    
    if (!response || !response.highlights) return [];
    return response.highlights;
  } catch (error) {
    console.error("Error generating transcript highlights:", error);
    return [];
  }
};

/**
 * Trigger background caching of company documents
 */
export const triggerDocumentCaching = async (symbol: string, documentType?: 'transcripts' | 'filings'): Promise<void> => {
  try {
    // Fire and forget - no need to wait for result
    invokeSupabaseFunction('cache-company-documents', { 
      symbol, 
      documentType 
    }).catch(error => {
      console.error("Error triggering document caching:", error);
    });
  } catch (error) {
    console.error("Error triggering document caching:", error);
  }
};

/**
 * Download an earnings transcript - returns the full content if available
 */
export const downloadEarningsTranscript = async (symbol: string, quarter: string, year: string): Promise<string | null> => {
  try {
    // Check if we have it in our database
    const { data, error } = await supabase
      .from('earnings_transcripts')
      .select('content, title')
      .eq('symbol', symbol)
      .eq('quarter', quarter)
      .eq('year', year)
      .single();
    
    if (error) {
      console.error("Error fetching transcript:", error);
      return null;
    }
    
    if (data && data.content) {
      return data.content;
    }
    
    // If not in database, try to fetch from API directly
    // This would typically be handled by our caching mechanism,
    // but we can add direct API calls here if needed
    
    return null;
  } catch (error) {
    console.error(`Error downloading earnings transcript for ${symbol} ${quarter} ${year}:`, error);
    return null;
  }
};

/**
 * Get a direct download link for an SEC filing
 */
export const getSECFilingDownloadLink = (filingUrl: string): string => {
  // For SEC filings, we usually just return the original URL
  // as it typically points directly to the document on sec.gov
  return filingUrl;
};
