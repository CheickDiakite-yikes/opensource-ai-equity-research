
import { invokeSupabaseFunction } from "../base";
import { GrowthInsight } from "@/types/aiAnalysisTypes";
import { EarningsCall, SECFiling } from "@/types";

/**
 * Analyze growth insights from earnings calls and SEC filings
 */
export const analyzeGrowthInsights = async (
  symbol: string,
  transcripts: EarningsCall[],
  filings: SECFiling[]
): Promise<GrowthInsight[]> => {
  try {
    console.log(`Analyzing growth insights for ${symbol}`);
    
    const data = await invokeSupabaseFunction<GrowthInsight[]>('analyze-growth-insights', {
      symbol,
      transcripts,
      filings
    });
    
    if (!data || !Array.isArray(data)) {
      console.error("Invalid response from growth insights analysis:", data);
      return [];
    }
    
    console.log(`Received ${data.length} growth insights for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error analyzing growth insights:", error);
    return [];
  }
};
