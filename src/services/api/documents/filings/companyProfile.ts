
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";

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
