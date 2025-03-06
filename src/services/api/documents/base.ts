
import { invokeSupabaseFunction } from "../base";

/**
 * Trigger background caching of company documents
 */
export const triggerDocumentCaching = async (
  symbol: string, 
  docType: 'transcripts' | 'filings' | 'all' = 'all'
): Promise<boolean> => {
  try {
    await invokeSupabaseFunction('cache-company-documents', {
      symbol,
      docType
    });
    return true;
  } catch (error) {
    console.error("Error triggering document caching:", error);
    return false;
  }
};
