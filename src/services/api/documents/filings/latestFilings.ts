
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";
import { SECFiling } from "@/types";

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
