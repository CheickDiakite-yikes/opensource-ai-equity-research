
import { getCachedOrFetchData } from "../core/caching";
import { supabase } from "../core/supabaseClient";

/**
 * Interface for semantic search results
 */
export interface SemanticSearchResult {
  doc_id: number;
  doc_type: 'transcript' | 'filing';
  symbol: string;
  date: string;
  title: string;
  relevance: number;
  content_snippet: string;
}

/**
 * Run semantic search on transcripts and filings
 */
export const runSemanticSearch = async (
  searchTerm: string,
  symbol?: string,
  docType: 'all' | 'transcripts' | 'filings' = 'all',
  limit: number = 20
): Promise<SemanticSearchResult[]> => {
  try {
    // Create a cache key based on search parameters
    const cacheKey = `search:${searchTerm}:${symbol || 'all'}:${docType}:${limit}`;
    
    return getCachedOrFetchData<SemanticSearchResult[]>(
      cacheKey,
      async () => {
        // Prepare search terms for tsquery format
        const formattedSearch = searchTerm
          .replace(/[^\w\s]/g, '') // Remove special chars
          .split(/\s+/)
          .filter(word => word.length > 2) // Only words longer than 2 chars
          .join(' & '); // Connect with AND operator
        
        if (!formattedSearch) {
          return [];
        }
        
        const { data, error } = await supabase.rpc('semantic_document_search', {
          p_search_term: formattedSearch,
          p_symbol: symbol || null,
          p_doc_type: docType,
          p_limit: limit
        });
        
        if (error) {
          console.error("Error running semantic search:", error);
          return [];
        }
        
        return data || [];
      },
      30 // Cache for 30 minutes
    );
  } catch (err) {
    console.error("Error in runSemanticSearch:", err);
    return [];
  }
};
