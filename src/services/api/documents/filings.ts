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
        id: filing.id,
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
    
    // Otherwise, get from Finnhub API with retry logic
    console.log(`Fetching SEC filings from API for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<SECFiling[]>('get-sec-filings', { symbol })
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
 * Get SEC filings by form type (10-K, 10-Q, 8-K, etc.)
 */
export const fetchSECFilingsByFormType = async (
  formType: string,
  from?: string,
  to?: string
): Promise<SECFiling[]> => {
  try {
    console.log(`Fetching SEC filings by form type: ${formType}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<SECFiling[]>('get-sec-filings-by-form', { 
        formType,
        from,
        to
      })
    );
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No SEC filings found for form type ${formType}`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching SEC filings by form type ${formType}:`, error);
    return [];
  }
};

/**
 * Get latest SEC filings 
 */
export const fetchLatestSECFilings = async (
  from?: string,
  to?: string,
  limit: number = 20
): Promise<SECFiling[]> => {
  try {
    console.log(`Fetching latest SEC filings`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<SECFiling[]>('get-latest-sec-filings', { 
        from,
        to,
        limit
      })
    );
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No latest SEC filings found`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching latest SEC filings:`, error);
    return [];
  }
};

/**
 * Get latest 8-K SEC filings
 */
export const fetchLatest8KFilings = async (
  from?: string,
  to?: string,
  limit: number = 20
): Promise<SECFiling[]> => {
  try {
    console.log(`Fetching latest 8-K SEC filings`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<SECFiling[]>('get-latest-8k-filings', { 
        from,
        to,
        limit
      })
    );
    
    if (!data || !Array.isArray(data)) {
      console.warn(`No latest 8-K SEC filings found`);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching latest 8-K SEC filings:`, error);
    return [];
  }
};

/**
 * Get SEC company profile by symbol
 */
export const fetchSECCompanyProfile = async (symbol: string): Promise<any> => {
  try {
    console.log(`Fetching SEC company profile for ${symbol}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<any>('get-sec-company-profile', { symbol })
    );
    
    if (!data) {
      console.warn(`No SEC company profile found for ${symbol}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching SEC company profile for ${symbol}:`, error);
    return null;
  }
};

/**
 * Get a direct download link for an SEC filing
 */
export const getSECFilingDownloadLink = async (
  url: string, 
  filingId?: number,
  symbol?: string,
  form?: string,
  filingDate?: string
): Promise<string> => {
  try {
    const response = await invokeSupabaseFunction<{ url: string, cached: boolean }>('download-sec-filing', {
      filingId,
      url,
      symbol,
      form,
      filingDate
    });
    
    if (response && response.url) {
      return response.url;
    }
    
    // Fallback to the original URL if the function fails
    return url;
  } catch (error) {
    console.error("Error getting SEC filing download link:", error);
    return url;
  }
};
