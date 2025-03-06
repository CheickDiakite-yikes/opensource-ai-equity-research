
import { invokeSupabaseFunction } from "../../base";

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
