
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";

/**
 * Generate AI highlights from earnings call transcript content
 */
export const generateTranscriptHighlights = async (
  content: string,
  metadata: {
    symbol: string;
    quarter: string;
    year: string;
    date: string;
  }
): Promise<string[]> => {
  try {
    console.log(`Generating highlights for ${metadata.symbol} ${metadata.quarter} ${metadata.year} transcript`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<{ highlights: string[] }>('generate-transcript-highlights', {
        content,
        metadata
      })
    );
    
    if (!data || !data.highlights || !Array.isArray(data.highlights)) {
      console.warn(`No highlights generated for ${metadata.symbol} ${metadata.quarter} ${metadata.year} transcript`);
      return [
        "Could not generate highlights for this transcript",
        "Please check back later or review the full transcript"
      ];
    }
    
    return data.highlights;
  } catch (error) {
    console.error(`Error generating transcript highlights:`, error);
    return [
      "Error generating highlights for this transcript",
      error instanceof Error ? error.message : "Unknown error occurred"
    ];
  }
};
