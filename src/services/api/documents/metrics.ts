
import { getCachedOrFetchData } from "../core/caching";
import { supabase } from "../core/supabaseClient";

/**
 * Extract financial metrics from document text
 */
export const extractDocumentMetrics = async (
  docId: number,
  docType: 'transcript' | 'filing'
): Promise<Record<string, string>> => {
  try {
    // Create a cache key
    const cacheKey = `metrics:${docType}:${docId}`;
    
    return getCachedOrFetchData<Record<string, string>>(
      cacheKey,
      async () => {
        const { data, error } = await supabase.rpc('extract_financial_metrics', {
          p_doc_id: docId,
          p_doc_type: docType
        });
        
        if (error) {
          console.error("Error extracting financial metrics:", error);
          return {};
        }
        
        return data || {};
      },
      1440 // Cache for 24 hours as document content doesn't change
    );
  } catch (err) {
    console.error("Error in extractDocumentMetrics:", err);
    return {};
  }
};
