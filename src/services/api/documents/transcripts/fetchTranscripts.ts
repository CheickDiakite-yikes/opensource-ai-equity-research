import { invokeSupabaseFunction, withRetry } from "../../base";
import { EarningsCall } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { triggerDocumentCaching } from "../base";
import { generateTranscriptHighlights } from "./transcriptHighlights";

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
