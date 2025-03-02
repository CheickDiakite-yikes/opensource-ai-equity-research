import { invokeSupabaseFunction, withRetry } from "./base";
import { EarningsCall, SECFiling } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
    
    if (error) {
      console.error("Database error fetching transcripts:", error);
      // Continue to API fallback instead of throwing
    }
    
    // If we have cached data, use it
    if (cachedTranscripts && cachedTranscripts.length > 0) {
      console.log(`Using ${cachedTranscripts.length} cached transcripts for ${symbol}`);
      return cachedTranscripts.map(transcript => ({
        symbol: transcript.symbol,
        quarter: transcript.quarter,
        year: transcript.year,
        date: transcript.date,
        content: transcript.content || "",
        url: transcript.url || `https://seekingalpha.com/symbol/${symbol}/earnings/transcripts`,
        highlights: Array.isArray(transcript.highlights) 
          ? transcript.highlights.map(item => String(item)) 
          : []
      }));
    }
    
    // Otherwise, get from API with retry logic
    console.log(`Fetching transcripts from API for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<EarningsCall[]>('get-stock-data', { 
        symbol, 
        endpoint: 'earning-transcripts' 
      })
    );
    
    // Trigger background caching process
    triggerDocumentCaching(symbol, 'transcripts');
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No transcript data returned for ${symbol}`);
      return [];
    }
    
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
    
    if (error) {
      console.error("Database error fetching SEC filings:", error);
      // Continue to API fallback instead of throwing
    }
    
    // If we have cached data, use it
    if (cachedFilings && cachedFilings.length > 0) {
      console.log(`Using ${cachedFilings.length} cached SEC filings for ${symbol}`);
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
    
    // Otherwise, get from API with retry logic
    console.log(`Fetching SEC filings from API for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<SECFiling[]>('get-stock-data', { 
        symbol, 
        endpoint: 'sec-filings' 
      })
    );
    
    // Trigger background caching process
    triggerDocumentCaching(symbol, 'filings');
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No SEC filing data returned for ${symbol}`);
      return [];
    }
    
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
    if (!transcriptText || transcriptText.trim().length < 100) {
      console.warn("Transcript text too short to generate highlights");
      return [];
    }
    
    const payload: any = { transcriptText };
    
    // Include metadata if available for caching
    if (metadata) {
      payload.symbol = metadata.symbol;
      payload.quarter = metadata.quarter;
      payload.year = metadata.year;
      payload.date = metadata.date;
    }
    
    const response = await withRetry(() => 
      invokeSupabaseFunction<{ highlights: string[] }>('generate-transcript-highlights', payload)
    );
    
    if (!response || !response.highlights) {
      console.warn("No highlights returned from API");
      return [];
    }
    
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
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching transcript:", error);
      return null;
    }
    
    if (data && data.content) {
      return data.content;
    }
    
    // If not in database, try to fetch from API directly
    console.log(`Transcript not in database, fetching from API for ${symbol} ${quarter} ${year}`);
    
    // Try to fetch it directly from the API
    const response = await withRetry(() => 
      invokeSupabaseFunction<{content: string}>('get-stock-data', { 
        symbol, 
        endpoint: 'transcript-content',
        quarter,
        year
      })
    );
    
    if (response && response.content) {
      // Store it in the database for future use
      await supabase
        .from('earnings_transcripts')
        .upsert({
          symbol,
          quarter,
          year,
          date: new Date().toISOString().split('T')[0],
          content: response.content
        })
        .catch(err => console.error("Error caching transcript:", err));
        
      return response.content;
    }
    
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
