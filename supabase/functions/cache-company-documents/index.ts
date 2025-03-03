
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Environment variables
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, docType } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!docType || !["transcripts", "filings", "all"].includes(docType)) {
      return new Response(
        JSON.stringify({ error: "Valid docType is required (transcripts, filings, or all)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing document caching for ${symbol}, type: ${docType}`);
    
    // Flag to track if we've made any updates
    let updatedData = false;
    
    // Handle transcripts caching
    if (docType === "transcripts" || docType === "all") {
      updatedData = await cacheTranscripts(symbol) || updatedData;
    }
    
    // Handle SEC filings caching
    if (docType === "filings" || docType === "all") {
      updatedData = await cacheFilings(symbol) || updatedData;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: updatedData ? `${docType} data for ${symbol} cached successfully` : `No new ${docType} data found for ${symbol}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error caching documents:", error);
    
    return new Response(
      JSON.stringify({ error: `Failed to cache documents: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

/**
 * Cache earnings call transcripts for a symbol
 */
async function cacheTranscripts(symbol: string): Promise<boolean> {
  try {
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
      .filter(t => !existingKeys.has(`${t.quarter || t.period}-${t.year}`))
      .map(t => ({
        symbol: t.symbol,
        quarter: t.quarter || t.period,
        year: t.year,
        date: t.date,
        content: t.content || "",
        title: `${t.symbol} ${t.quarter || t.period} ${t.year} Earnings Call`,
        url: `https://financialmodelingprep.com/api/v3/earning_call_transcript/${t.symbol}/${t.quarter || t.period}/${t.year}`
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

/**
 * Cache SEC filings for a symbol
 */
async function cacheFilings(symbol: string): Promise<boolean> {
  try {
    // Fetch SEC filings from FMP API
    const apiUrl = `https://financialmodelingprep.com/api/v3/sec_filings/${symbol}?apikey=${FMP_API_KEY}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`Error fetching SEC filings: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const filings = await response.json();
    
    if (!Array.isArray(filings) || filings.length === 0) {
      console.log(`No SEC filings found for ${symbol}`);
      return false;
    }
    
    console.log(`Found ${filings.length} SEC filings for ${symbol}`);
    
    // Get existing filings to avoid duplicates
    const { data: existingFilings } = await supabase
      .from('sec_filings')
      .select('filingNumber')
      .eq('symbol', symbol);
    
    const existingFilingNumbers = new Set(
      (existingFilings || []).map(f => f.filingNumber)
    );
    
    // Prepare filings for database insertion
    const filingsToInsert = filings
      .filter(f => !existingFilingNumbers.has(f.filingNumber))
      .map(f => ({
        symbol: f.symbol,
        type: `${f.form} (${f.form === "10-K" ? "Annual Report" : f.form === "10-Q" ? "Quarterly Report" : "Filing"})`,
        filingDate: f.fillingDate || f.filingDate,
        reportDate: f.acceptanceDate || f.acceptedDate || f.fillingDate || f.filingDate,
        cik: f.cik,
        form: f.form,
        url: f.finalLink || `https://www.sec.gov/Archives/edgar/data/${f.cik}/${f.filingNumber.replace(/-/g, "")}.txt`,
        filingNumber: f.filingNumber
      }));
    
    if (filingsToInsert.length === 0) {
      console.log(`No new SEC filings to cache for ${symbol}`);
      return false;
    }
    
    // Insert new filings
    const { error } = await supabase
      .from('sec_filings')
      .upsert(filingsToInsert);
    
    if (error) {
      console.error(`Error caching SEC filings: ${error.message}`);
      return false;
    }
    
    console.log(`Cached ${filingsToInsert.length} SEC filings for ${symbol}`);
    return true;
    
  } catch (error) {
    console.error(`Error in cacheFilings for ${symbol}:`, error);
    return false;
  }
}
