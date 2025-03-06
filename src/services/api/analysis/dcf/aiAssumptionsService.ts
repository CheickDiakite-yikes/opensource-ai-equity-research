
import { invokeSupabaseFunction } from "../../base";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch AI-generated DCF assumptions for a company
 */
export const fetchAIDCFAssumptions = async (symbol: string, refreshCache = false): Promise<AIDCFSuggestion | null> => {
  try {
    console.log(`Fetching AI DCF assumptions for ${symbol}, refreshCache=${refreshCache}`);
    
    // Check if we have cached assumptions in Supabase
    if (!refreshCache) {
      const { data: cachedData, error: cacheError } = await supabase
        .from('dcf_assumptions')
        .select('*')
        .eq('symbol', symbol)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!cacheError && cachedData) {
        console.log(`Using cached DCF assumptions for ${symbol}`);
        return cachedData.assumptions as AIDCFSuggestion;
      }
    }
    
    // If no cache or refreshing, call the edge function
    const data = await invokeSupabaseFunction<AIDCFSuggestion>('generate-dcf-assumptions', { 
      symbol, 
      refreshCache 
    });
    
    if (!data) {
      console.error("No data returned from AI DCF assumptions API");
      return null;
    }
    
    // Store the result in Supabase for future use
    if (data) {
      const { error: insertError } = await supabase
        .from('dcf_assumptions')
        .insert({
          symbol: symbol,
          assumptions: data,
          created_at: new Date().toISOString(),
          expires_at: data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (insertError) {
        console.error("Error saving DCF assumptions to Supabase:", insertError);
      }
    }
    
    console.log(`Received AI DCF assumptions for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error fetching AI DCF assumptions:", error);
    throw error;
  }
};
