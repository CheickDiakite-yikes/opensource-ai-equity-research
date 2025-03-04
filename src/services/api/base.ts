
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Create a supabase client with proper fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rnpcygrrxeeqphdjuesh.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucGN5Z3JyeGVlcXBoZGp1ZXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MTA3MTIsImV4cCI6MjA1NjA4NjcxMn0.MP1Q_KRdViDCLJdYr_Z_i1_vAMMZgEv3_yX9MGIN0lc";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Log the initialization to help with debugging
console.log(`Supabase client initialized with URL: ${supabaseUrl.substring(0, 20)}...`);

/**
 * Generic function to invoke a Supabase Edge Function
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string,
  payload: any
): Promise<T> => {
  try {
    console.log(`Invoking Supabase function: ${functionName} with payload:`, payload);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw new Error(`API error (${functionName}): ${error.message}`);
    }

    if (data && data.error) {
      console.error(`API error from ${functionName}:`, data.error);
      throw new Error(`API error (${functionName}): ${data.error}`);
    }

    return data as T;
  } catch (err) {
    // Special handling for network errors
    if (err instanceof Error && err.message.includes('Failed to fetch')) {
      console.error(`Network error calling ${functionName}:`, err);
      
      // Don't show toast for connection issues as they often happen in development
      // and can be spammy, but log them clearly
      console.warn("⚠️ Connection issue detected. Make sure Supabase Edge Functions are deployed.");
      
      throw new Error(`Network error: Could not connect to ${functionName}. Please check your internet connection.`);
    }
    
    // Show toast for other errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    toast.error(`API error: ${errorMessage}`, {
      duration: 5000,
    });
    
    throw err;
  }
};

/**
 * Function to get data from API cache or fetch it if not cached
 */
export const getCachedOrFetchData = async <T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  cacheTTLMinutes: number = 60
): Promise<T> => {
  try {
    // Try to get data from cache
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + cacheTTLMinutes);
    
    const { data: cachedData, error: cacheError } = await supabase
      .rpc('get_or_create_cache', {
        p_cache_key: cacheKey,
        p_expires_at: expiresAt.toISOString(),
        p_default_data: null
      });
    
    // If we have valid cached data, return it
    if (!cacheError && cachedData !== null) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData as T;
    }
    
    // Otherwise fetch fresh data
    console.log(`Cache miss for ${cacheKey}, fetching fresh data...`);
    const freshData = await fetchFunction();
    
    // Store the fresh data in cache for future requests
    if (freshData) {
      const { error: updateError } = await supabase
        .from('api_cache')
        .upsert({
          cache_key: cacheKey,
          data: freshData as any,
          expires_at: expiresAt.toISOString(),
          metadata: { 
            fetched_at: new Date().toISOString()
          }
        }, { onConflict: 'cache_key' });
      
      if (updateError) {
        console.error(`Error updating cache for ${cacheKey}:`, updateError);
      }
    }
    
    return freshData;
  } catch (err) {
    console.error(`Error in getCachedOrFetchData for ${cacheKey}:`, err);
    throw err;
  }
};

/**
 * Utility function to retry an API call with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Initial delay in ms
 * @returns Result of the function
 */
export const withRetry = async <T>(
  fn: () => Promise<T>, 
  retries = 2, 
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying API call... ${retries} attempts left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
};

/**
 * Function to run regular database maintenance
 */
export const runDatabaseMaintenance = async (): Promise<boolean> => {
  try {
    const result = await invokeSupabaseFunction<{ success: boolean }>('optimize-database', {
      action: 'maintenance'
    });
    
    return result.success;
  } catch (err) {
    console.error("Error running database maintenance:", err);
    return false;
  }
};

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
