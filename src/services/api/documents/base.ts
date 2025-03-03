
import { invokeSupabaseFunction, withRetry } from "../base";
import { supabase } from "@/integrations/supabase/client";

/**
 * Trigger background caching of company documents
 */
export const triggerDocumentCaching = async (symbol: string, docType?: 'transcripts' | 'filings' | 'all'): Promise<void> => {
  try {
    console.log(`Triggering document caching for ${symbol}, type: ${docType || 'all'}`);
    
    // Fire and forget - no need to wait for result
    invokeSupabaseFunction('cache-company-documents', { 
      symbol, 
      docType: docType || 'all'
    }).catch(error => {
      console.error("Error triggering document caching:", error);
    });
  } catch (error) {
    console.error("Error triggering document caching:", error);
  }
};
