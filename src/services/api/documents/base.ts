
import { invokeSupabaseFunction, withRetry } from "../base";
import { supabase } from "@/integrations/supabase/client";

/**
 * Trigger background caching of company documents
 */
export const triggerDocumentCaching = async (symbol: string, documentType?: 'transcripts' | 'filings'): Promise<void> => {
  try {
    // Fire and forget - no need to wait for result
    invokeSupabaseFunction('cache-company-documents', { 
      symbol, 
      documentType 
    }).catch(error => {
      console.error("Error triggering document caching:", error);
    });
  } catch (error) {
    console.error("Error triggering document caching:", error);
  }
};
