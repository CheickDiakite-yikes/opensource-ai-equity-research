
import { invokeSupabaseFunction, withRetry } from "../../base";
import { supabase } from "@/integrations/supabase/client";

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
    
    const response = await withRetry(async () => {
      const { data, error } = await invokeSupabaseFunction<any[]>('fetch-earnings-transcripts', { 
        symbol, 
        quarter,
        year
      });
      
      if (error) throw error;
      if (!data) throw new Error("No data returned from transcript API");
      
      return data;
    });
    
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
