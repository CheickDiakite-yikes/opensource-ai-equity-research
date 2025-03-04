
import { invokeSupabaseFunction, withRetry } from "../base";
import { EarningsCall } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { triggerDocumentCaching } from "./base";

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
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error("Database error fetching transcripts:", error);
      // Continue to API fallback instead of throwing
    }
    
    // If we have cached data, use it
    if (cachedTranscripts && cachedTranscripts.length > 0) {
      console.log(`Using ${cachedTranscripts.length} cached transcripts for ${symbol}`);
      return cachedTranscripts.map(transcript => ({
        id: transcript.id,
        symbol: transcript.symbol,
        quarter: transcript.quarter,
        year: transcript.year,
        date: transcript.date,
        content: transcript.content || "",
        title: transcript.title,
        url: transcript.url || `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}/${transcript.quarter}/${transcript.year}`,
        highlights: Array.isArray(transcript.highlights) 
          ? transcript.highlights.map(item => String(item)) 
          : []
      }));
    }
    
    // Otherwise, get from API with retry logic
    console.log(`Fetching transcripts from API for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<any[]>('fetch-earnings-transcripts', { 
        symbol,
        limit: 5
      })
    );
    
    // Format the response to match our EarningsCall type
    const formattedData = data.map(transcript => ({
      symbol: transcript.symbol,
      quarter: transcript.quarter,
      year: transcript.year,
      date: transcript.date,
      content: transcript.content || "",
      title: `${symbol} ${transcript.quarter} ${transcript.year} Earnings Call`,
      url: `https://financialmodelingprep.com/api/v3/earning_call_transcript/${symbol}/${transcript.quarter}/${transcript.year}`,
      highlights: []
    }));
    
    // Trigger background caching process
    triggerDocumentCaching(symbol, 'transcripts');
    
    // For the first two transcripts, generate highlights immediately
    if (formattedData.length > 0) {
      const transcriptsWithHighlights = await Promise.all(
        formattedData.slice(0, 2).map(async (call) => {
          if (call.content && call.content.length > 100) {
            try {
              const highlights = await generateTranscriptHighlights(call.content, {
                symbol: call.symbol,
                quarter: call.quarter,
                year: call.year,
                date: call.date
              });
              return { ...call, highlights };
            } catch (e) {
              console.error("Error generating highlights:", e);
              return call;
            }
          }
          return call;
        })
      );
      
      // Return the first 2 transcripts with highlights, plus any additional ones without highlights
      return [
        ...transcriptsWithHighlights,
        ...formattedData.slice(2)
      ];
    }
    
    return formattedData;
  } catch (error) {
    console.error("Error fetching earnings transcripts:", error);
    return [];
  }
};

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
    
    // If not in database, fetch directly from our edge function
    console.log(`Transcript not in database, fetching from API for ${symbol} ${quarter} ${year}`);
    
    const response = await withRetry(() => 
      invokeSupabaseFunction<any[]>('fetch-earnings-transcripts', { 
        symbol, 
        quarter,
        year
      })
    );
    
    if (response && response.length > 0 && response[0].content) {
      const content = response[0].content;
      
      // Store it in the database for future use
      try {
        await supabase
          .from('earnings_transcripts')
          .upsert({
            symbol,
            quarter,
            year,
            date: response[0].date,
            content
          });
      } catch (err) {
        console.error("Error caching transcript:", err);
      }
        
      return content;
    }
    
    return null;
  } catch (error) {
    console.error(`Error downloading earnings transcript for ${symbol} ${quarter} ${year}:`, error);
    return null;
  }
};
