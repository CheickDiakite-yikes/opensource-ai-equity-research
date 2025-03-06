
import { invokeSupabaseFunction } from "../../core/edgeFunctions";
import { withRetry } from "../../core/retryStrategy";

/**
 * Download the full content of an earnings transcript
 */
export const downloadEarningsTranscript = async (
  symbol: string,
  quarter: string,
  year: string,
  url?: string
): Promise<string> => {
  try {
    console.log(`Downloading earnings transcript for ${symbol} ${quarter} ${year}`);
    const data = await withRetry(() => 
      invokeSupabaseFunction<{ content: string }>('download-transcript', { 
        symbol,
        quarter,
        year,
        url
      })
    );
    
    if (!data || !data.content) {
      console.warn(`No transcript content found for ${symbol} ${quarter} ${year}`);
      return `Transcript not available for ${symbol} ${quarter} ${year}`;
    }
    
    return data.content;
  } catch (error) {
    console.error(`Error downloading transcript for ${symbol} ${quarter} ${year}:`, error);
    return `Error downloading transcript: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
