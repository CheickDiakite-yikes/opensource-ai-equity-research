
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, documentType } = await req.json();

    if (!symbol) {
      return new Response(JSON.stringify({ error: "Symbol is required" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    let result = {};
    
    // Cache both document types by default if none specified
    if (!documentType || documentType === "transcripts") {
      const transcripts = await fetchAndCacheEarningsTranscripts(symbol);
      result.transcripts = { cached: transcripts.length };
    }
    
    if (!documentType || documentType === "filings") {
      const filings = await fetchAndCacheSECFilings(symbol);
      result.filings = { cached: filings.length };
    }
    
    return new Response(JSON.stringify(result), { 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  } catch (error) {
    console.error("Error caching company documents:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }
});

/**
 * Fetch and cache earnings call transcripts for a company
 */
async function fetchAndCacheEarningsTranscripts(symbol: string): Promise<any[]> {
  try {
    // Fetch earnings call transcripts from FMP API
    const response = await fetch(
      `https://financialmodelingprep.com/api/v4/earning_call_transcript/${symbol}?apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const transcripts = await response.json();
    
    if (!Array.isArray(transcripts) || transcripts.length === 0) {
      console.log(`No transcripts found for ${symbol}`);
      return [];
    }
    
    // Process and store each transcript
    const processedTranscripts = [];
    
    for (const transcript of transcripts.slice(0, 10)) { // Limit to 10 most recent
      // Check if transcript already exists
      const { data: existingTranscript } = await supabase
        .from('earnings_transcripts')
        .select('id')
        .eq('symbol', symbol)
        .eq('quarter', transcript.quarter)
        .eq('year', transcript.year)
        .single();
      
      if (!existingTranscript) {
        // Insert new transcript
        const { data, error } = await supabase
          .from('earnings_transcripts')
          .insert({
            symbol: symbol,
            quarter: transcript.quarter,
            year: transcript.year,
            date: new Date(transcript.date).toISOString(),
            title: transcript.title || `${symbol} ${transcript.quarter} ${transcript.year} Earnings Call`,
            content: transcript.content,
            url: transcript.url || `https://financialmodelingprep.com/api/v4/earning_call_transcript/${symbol}/${transcript.quarter}/${transcript.year}`
          })
          .select();
        
        if (error) {
          console.error(`Error storing transcript for ${symbol}:`, error);
        } else {
          processedTranscripts.push(data[0]);
          
          // Generate highlights asynchronously if content is available
          if (transcript.content) {
            try {
              const highlights = await generateHighlightsInBackground(
                transcript.content, 
                symbol, 
                transcript.quarter, 
                transcript.year
              );
              
              // Update the transcript with highlights
              await supabase
                .from('earnings_transcripts')
                .update({ highlights })
                .eq('id', data[0].id);
            } catch (highlightError) {
              console.error(`Error generating highlights for ${symbol}:`, highlightError);
            }
          }
        }
      } else {
        // Transcript already exists, no need to insert
        processedTranscripts.push(existingTranscript);
      }
    }
    
    return processedTranscripts;
  } catch (error) {
    console.error(`Error fetching transcripts for ${symbol}:`, error);
    return [];
  }
}

/**
 * Generate highlights from transcript text in a background task
 */
async function generateHighlightsInBackground(
  content: string, 
  symbol: string, 
  quarter: string, 
  year: string
): Promise<string[]> {
  try {
    // Call our own function to generate highlights
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-transcript-highlights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        transcriptText: content,
        symbol,
        quarter,
        year
      })
    });
    
    if (!response.ok) {
      throw new Error(`Highlight generation failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.highlights || [];
  } catch (error) {
    console.error(`Error generating highlights in background:`, error);
    return [];
  }
}

/**
 * Fetch and cache SEC filings for a company
 */
async function fetchAndCacheSECFilings(symbol: string): Promise<any[]> {
  try {
    // Fetch SEC filings from FMP API
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const filings = await response.json();
    
    if (!Array.isArray(filings) || filings.length === 0) {
      console.log(`No SEC filings found for ${symbol}`);
      return [];
    }
    
    // Process and store each filing
    const processedFilings = [];
    
    for (const filing of filings.slice(0, 20)) { // Limit to 20 most recent
      // Check if filing already exists
      const { data: existingFiling } = await supabase
        .from('sec_filings')
        .select('id')
        .eq('symbol', symbol)
        .eq('form', filing.form)
        .eq('filing_date', new Date(filing.fillingDate).toISOString().split('T')[0])
        .single();
      
      if (!existingFiling) {
        // Format the filing type to be more user-friendly
        const type = formatFilingType(filing.form);
        
        // Insert new filing
        const { data, error } = await supabase
          .from('sec_filings')
          .insert({
            symbol: symbol,
            type: type,
            form: filing.form,
            filing_date: new Date(filing.fillingDate).toISOString(),
            report_date: filing.acceptedDate ? new Date(filing.acceptedDate).toISOString() : null,
            cik: filing.cik || "",
            url: filing.finalLink || "",
            filing_number: filing.filingNumber || ""
          })
          .select();
        
        if (error) {
          console.error(`Error storing SEC filing for ${symbol}:`, error);
        } else {
          processedFilings.push(data[0]);
        }
      } else {
        // Filing already exists, no need to insert
        processedFilings.push(existingFiling);
      }
    }
    
    return processedFilings;
  } catch (error) {
    console.error(`Error fetching SEC filings for ${symbol}:`, error);
    return [];
  }
}

/**
 * Format SEC filing type to be more user-friendly
 */
function formatFilingType(form: string): string {
  const filingTypes: Record<string, string> = {
    "10-K": "10-K (Annual Report)",
    "10-Q": "10-Q (Quarterly Report)",
    "8-K": "8-K (Current Report)",
    "DEF 14A": "DEF 14A (Proxy Statement)",
    "S-1": "S-1 (Registration Statement)",
    "S-3": "S-3 (Registration Statement)",
    "S-4": "S-4 (Registration Statement)",
    "SC 13G": "SC 13G (Beneficial Ownership)"
  };
  
  return filingTypes[form] || form;
}
