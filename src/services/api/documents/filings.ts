import { invokeSupabaseFunction, withRetry } from "../base";
import { SECFiling } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { triggerDocumentCaching } from "./base";

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
 * Get a direct download link for an SEC filing
 */
export const getSECFilingDownloadLink = (filingUrl: string): string => {
  // For SEC filings, we usually just return the original URL
  // as it typically points directly to the document on sec.gov
  return filingUrl;
};
