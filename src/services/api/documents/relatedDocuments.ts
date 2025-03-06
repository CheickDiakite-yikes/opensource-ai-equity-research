
import { getCachedOrFetchData } from "../core/caching";
import { supabase } from "../core/supabaseClient";

/**
 * Interface for related document results
 */
export interface RelatedDocument {
  doc_id: number;
  doc_type: 'transcript' | 'filing';
  symbol: string;
  date: string;
  title: string;
  similarity: number;
}

/**
 * Get related documents for a specific document
 */
export const getRelatedDocuments = async (
  docId: number,
  docType: 'transcript' | 'filing',
  limit: number = 5
): Promise<RelatedDocument[]> => {
  try {
    // Create a cache key
    const cacheKey = `related:${docType}:${docId}:${limit}`;
    
    return getCachedOrFetchData<RelatedDocument[]>(
      cacheKey,
      async () => {
        const { data, error } = await supabase.rpc('get_related_documents', {
          p_doc_id: docId,
          p_doc_type: docType,
          p_limit: limit
        });
        
        if (error) {
          console.error("Error getting related documents:", error);
          return [];
        }
        
        return data || [];
      },
      60 // Cache for 60 minutes as document relationships don't change often
    );
  } catch (err) {
    console.error("Error in getRelatedDocuments:", err);
    return [];
  }
};
