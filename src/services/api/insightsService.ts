
import { invokeSupabaseFunction, withRetry } from "./base";
import { EarningsCall, SECFiling } from "@/types";
import { toast } from "sonner";

export interface GrowthInsight {
  type: "positive" | "risk" | "neutral";
  content: string;
}

/**
 * Generate growth insights from earnings transcripts and SEC filings
 */
export const generateGrowthInsights = async (
  symbol: string,
  transcript?: EarningsCall,
  filing?: SECFiling
): Promise<GrowthInsight[]> => {
  try {
    if (!transcript && !filing) {
      console.warn(`No documents available for ${symbol} to generate insights`);
      return [];
    }

    console.log(`Generating growth insights for ${symbol}`);
    
    // For logging purposes
    const hasTranscript = !!transcript && transcript.content && transcript.content.length > 100;
    const hasFiling = !!filing && !!filing.url;
    
    console.log(`Documents available: transcript=${hasTranscript}, filing=${hasFiling}`);
    
    // Use retry logic for AI analysis
    const data = await withRetry(() => 
      invokeSupabaseFunction<{ insights: GrowthInsight[] }>('analyze-growth-trends', { 
        symbol,
        transcriptData: transcript || null,
        filingData: filing || null
      }),
      1, // fewer retries for this operation
      2000 // longer initial delay
    );
    
    if (!data || !data.insights || !Array.isArray(data.insights)) {
      console.error("Failed to generate growth insights or empty result");
      return [];
    }
    
    return data.insights;
  } catch (error) {
    console.error("Error generating growth insights:", error);
    toast.error("Failed to analyze growth trends. Please try again later.");
    return [];
  }
};
