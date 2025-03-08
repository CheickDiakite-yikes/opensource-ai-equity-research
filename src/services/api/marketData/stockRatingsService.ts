
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
import { API_BASE_URLS, FMP_API_KEY } from "../../../../supabase/functions/_shared/constants";
import { fetchWithRetry, handleFetchResponse } from "../../../../supabase/functions/_shared/fetch-utils";

/**
 * Fetch stock rating snapshot from FMP API
 */
export const fetchRatingSnapshot = async (symbol: string): Promise<RatingSnapshot | null> => {
  try {
    console.log(`Fetching rating snapshot for ${symbol}`);
    
    // Check if API key is available
    if (!FMP_API_KEY) {
      console.warn("FMP_API_KEY is not set. Using fallback from API_KEY in fmpApi");
      // Try to use the API key from fmpApi.ts as fallback
      const fallbackKey = "d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg";
      
      const url = `${API_BASE_URLS.FMP}/rating/${symbol}?apikey=${fallbackKey}`;
      const response = await fetchWithRetry(url);
      const data = await handleFetchResponse<RatingSnapshot[]>(response);
      
      console.log(`Rating snapshot result for ${symbol}:`, data ? `Found ${data.length} results` : 'No data');
      return data && data.length > 0 ? data[0] : null;
    }
    
    const url = `${API_BASE_URLS.FMP}/rating/${symbol}?apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    const data = await handleFetchResponse<RatingSnapshot[]>(response);
    
    console.log(`Rating snapshot result for ${symbol}:`, data ? `Found ${data.length} results` : 'No data');
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching rating snapshot:", error);
    return null;
  }
};

/**
 * Fetch stock grade news from FMP API
 */
export const fetchGradeNews = async (symbol: string, limit: number = 5): Promise<GradeNews[]> => {
  try {
    console.log(`Fetching grade news for ${symbol}, limit: ${limit}`);
    
    // Check if API key is available
    if (!FMP_API_KEY) {
      console.warn("FMP_API_KEY is not set. Using fallback from API_KEY in fmpApi");
      // Try to use the API key from fmpApi.ts as fallback
      const fallbackKey = "d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg";
      
      // We need to use the correct endpoint name "grade" (not "grades")
      const url = `${API_BASE_URLS.FMP}/grade/${symbol}?limit=${limit}&apikey=${fallbackKey}`;
      const response = await fetchWithRetry(url);
      const data = await handleFetchResponse<GradeNews[]>(response);
      
      console.log(`Grade news result for ${symbol}:`, data ? `Found ${data.length} results` : 'No data');
      return data || [];
    }
    
    // The correct endpoint is "grade" (not "grades-news" or "upgrade_downgrade")
    const url = `${API_BASE_URLS.FMP}/grade/${symbol}?limit=${limit}&apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    const data = await handleFetchResponse<GradeNews[]>(response);
    
    console.log(`Grade news result for ${symbol}:`, data ? `Found ${data.length} results` : 'No data');
    return data || [];
  } catch (error) {
    console.error("Error fetching grade news:", error);
    return [];
  }
};
