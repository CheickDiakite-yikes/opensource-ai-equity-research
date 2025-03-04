
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0";

/**
 * Cache earnings call transcripts for a symbol
 */
export async function cacheTranscripts(
  symbol: string, 
  supabaseUrl: string, 
  supabaseServiceRole: string
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Use our new dedicated edge function
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/fetch-earnings-transcripts`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      },
      body: JSON.stringify({ symbol, limit: 10 })
    });
    
    if (!response.ok) {
      console.error(`Error fetching transcripts: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const transcripts = await response.json();
    
    if (!Array.isArray(transcripts) || transcripts.length === 0) {
      console.log(`No transcripts found for ${symbol}`);
      return false;
    }
    
    console.log(`Found ${transcripts.length} transcripts for ${symbol}`);
    
    // Get existing transcripts to avoid duplicates
    const { data: existingTranscripts } = await supabase
      .from('earnings_transcripts')
      .select('quarter, year')
      .eq('symbol', symbol);
    
    const existingKeys = new Set(
      (existingTranscripts || []).map(t => `${t.quarter}-${t.year}`)
    );
    
    // Prepare transcripts for database insertion
    const transcriptsToInsert = transcripts
      .filter(t => {
        if (!t.quarter || !t.year) return false;
        return !existingKeys.has(`${t.quarter}-${t.year}`);
      })
      .map(t => ({
        symbol: t.symbol,
        quarter: t.quarter,
        year: t.year,
        date: t.date,
        content: t.content || "",
        title: `${t.symbol} ${t.quarter} ${t.year} Earnings Call`,
        url: `https://financialmodelingprep.com/api/v3/earning_call_transcript/${t.symbol}/${t.quarter}/${t.year}`
      }));
    
    if (transcriptsToInsert.length === 0) {
      console.log(`No new transcripts to cache for ${symbol}`);
      return false;
    }
    
    // Insert new transcripts
    const { error } = await supabase
      .from('earnings_transcripts')
      .upsert(transcriptsToInsert);
    
    if (error) {
      console.error(`Error caching transcripts: ${error.message}`);
      return false;
    }
    
    console.log(`Cached ${transcriptsToInsert.length} transcripts for ${symbol}`);
    return true;
    
  } catch (error) {
    console.error(`Error in cacheTranscripts for ${symbol}:`, error);
    return false;
  }
}
