
import { invokeSupabaseFunction } from "../../base";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";

/**
 * Fetch AI-generated DCF assumptions for a company
 */
export const fetchAIDCFAssumptions = async (symbol: string, refreshCache = false): Promise<AIDCFSuggestion | null> => {
  try {
    console.log(`Fetching AI DCF assumptions for ${symbol}, refreshCache=${refreshCache}`);
    
    // Call the Supabase Edge Function with improved error handling
    const { data, error } = await invokeSupabaseFunction<AIDCFSuggestion>(
      'generate-dcf-assumptions', 
      { symbol, refreshCache }
    );
    
    if (error) {
      console.error(`Error from Supabase function generate-dcf-assumptions:`, error);
      throw new Error(`Failed to fetch AI DCF assumptions: ${error.message}`);
    }
    
    if (!data) {
      console.error("No data returned from AI DCF assumptions API");
      throw new Error("Empty response from DCF assumptions service");
    }
    
    console.log(`Received AI DCF assumptions for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching AI DCF assumptions:", error);
    throw error;
  }
};
