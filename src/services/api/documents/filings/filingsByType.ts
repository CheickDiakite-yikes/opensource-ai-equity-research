
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";
import { SECFiling } from "@/types";

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
