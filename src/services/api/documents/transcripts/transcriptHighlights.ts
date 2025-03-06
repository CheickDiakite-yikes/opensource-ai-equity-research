
import { invokeSupabaseFunction, withRetry } from "../../base";

/**
 * Generate highlights from earnings transcript text using OpenAI
 */
export const generateTranscriptHighlights = async (
  transcriptText: string,
  metadata?: { symbol: string; quarter: string; year: string; date: string }
): Promise<string[]> => {
  try {
    if (!transcriptText || transcriptText.trim().length < 100) {
      console.warn("Transcript text too short to generate highlights");
      return [];
    }
    
    const payload: any = { transcriptText };
    
    // Include metadata if available for caching
    if (metadata) {
      payload.symbol = metadata.symbol;
      payload.quarter = metadata.quarter;
      payload.year = metadata.year;
      payload.date = metadata.date;
    }
    
    const { data, error } = await withRetry(async () => {
      const result = await invokeSupabaseFunction<{ highlights: string[] }>('generate-transcript-highlights', payload);
      if (result.error) throw result.error;
      return result;
    });
    
    if (error) {
      console.error("Error generating highlights with retry:", error);
      return [];
    }
    
    if (!data || !data.highlights) {
      console.warn("No highlights returned from API");
      return [];
    }
    
    return data.highlights;
  } catch (error) {
    console.error("Error generating transcript highlights:", error);
    return [];
  }
};
