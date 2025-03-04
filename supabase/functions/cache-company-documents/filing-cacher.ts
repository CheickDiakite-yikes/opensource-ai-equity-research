
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0";

// Environment variables
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

/**
 * Cache SEC filings for a symbol
 */
export async function cacheFilings(
  symbol: string,
  supabaseUrl: string,
  supabaseServiceRole: string
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
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
