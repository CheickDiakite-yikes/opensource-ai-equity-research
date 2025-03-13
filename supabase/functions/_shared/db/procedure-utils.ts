
/**
 * Utility functions for stored procedures
 */

/**
 * Helper function to create or execute a stored procedure
 */
export async function executeStoredProcedure(
  supabase: any,
  procedureName: string,
  procedureSQL: string
): Promise<boolean> {
  try {
    // Execute the procedure or create it if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_statement: procedureSQL
    });
    
    if (error) {
      console.error(`Error executing/creating stored procedure ${procedureName}:`, error);
      return false;
    }
    
    console.log(`Successfully executed/created stored procedure ${procedureName}`);
    return true;
  } catch (err) {
    console.error(`Error in executeStoredProcedure for ${procedureName}:`, err);
    return false;
  }
}

/**
 * Function to execute database functions with caching capabilities
 */
export async function executeDBFunction<T>(
  supabase: any,
  functionName: string,
  params: Record<string, any>,
  useCache: boolean = true,
  cacheTTLMinutes: number = 60
): Promise<T | null> {
  try {
    if (useCache) {
      // Create a cache key based on function name and params
      const cacheKey = `db_func:${functionName}:${JSON.stringify(params)}`;
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + cacheTTLMinutes);
      
      // Try to get from cache or create with default
      const { data, error } = await supabase.rpc('get_or_create_cache', {
        p_cache_key: cacheKey,
        p_expires_at: expiresAt.toISOString(),
        p_default_data: null
      });
      
      if (error) {
        console.error(`Cache error for DB function ${functionName}:`, error);
      } else if (data !== null) {
        console.log(`Cache hit for DB function ${functionName}`);
        return data as T;
      }
    }
    
    // Execute the function directly if no cache or cache miss
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(`Error executing DB function ${functionName}:`, error);
      return null;
    }
    
    return data as T;
  } catch (err) {
    console.error(`Error in executeDBFunction for ${functionName}:`, err);
    return null;
  }
}

/**
 * Helper to schedule the cache cleanup task
 */
export async function scheduleCacheCleanup(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('schedule_cache_cleanup');
    
    if (error) {
      console.error("Error scheduling cache cleanup:", error);
      return false;
    }
    
    console.log("Successfully scheduled cache cleanup");
    return true;
  } catch (err) {
    console.error("Error in scheduleCacheCleanup:", err);
    return false;
  }
}

/**
 * Interface for semantic search results
 */
interface SemanticSearchResult {
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
export async function runSemanticSearch(
  supabase: any,
  searchTerm: string,
  symbol?: string,
  docType: 'all' | 'transcripts' | 'filings' = 'all',
  limit: number = 20
): Promise<SemanticSearchResult[]> {
  try {
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
  } catch (err) {
    console.error("Error in runSemanticSearch:", err);
    return [];
  }
}

/**
 * Interface for related document results
 */
interface RelatedDocument {
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

/**
 * Extract financial metrics from documents using regex patterns
 */
export async function extractFinancialMetrics(
  supabase: any,
  docId: number,
  docType: 'transcript' | 'filing'
): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.rpc('extract_financial_metrics', {
      p_doc_id: docId,
      p_doc_type: docType
    });
    
    if (error) {
      console.error("Error extracting financial metrics:", error);
      return {};
    }
    
    return data || {};
  } catch (err) {
    console.error("Error in extractFinancialMetrics:", err);
    return {};
  }
}
