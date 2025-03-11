
import { SemanticSearchResult, RelatedDocument } from './types/database-types';

/**
 * Run semantic search on transcripts and filings
 */
export async function runSemanticSearch(
  supabase: any,
  searchTerm: string,
  symbol?: string,
  docType: 'all' | 'transcripts' | 'filings' = 'all',
  limit: number = 20
): Promise<SemanticSearchResult[]> {
  try {
    const formattedSearch = searchTerm
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .join(' & ');
    
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
  } catch (err) {
    console.error("Error in runSemanticSearch:", err);
    return [];
  }
}

/**
 * Get related documents for a specific document
 */
export async function getRelatedDocuments(
  supabase: any,
  docId: number,
  docType: 'transcript' | 'filing',
  limit: number = 5
): Promise<RelatedDocument[]> {
  try {
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
  } catch (err) {
    console.error("Error in getRelatedDocuments:", err);
    return [];
  }
}
