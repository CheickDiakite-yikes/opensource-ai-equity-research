
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
import { API_BASE_URLS, FMP_API_KEY } from "../../../../supabase/functions/_shared/constants";
import { fetchWithRetry, handleFetchResponse } from "../../../../supabase/functions/_shared/fetch-utils";

// Fallback API key to use when environment variable is not available
const FALLBACK_API_KEY = "d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg";

/**
 * Fetch stock rating snapshot from FMP API
 */
export const fetchRatingSnapshot = async (symbol: string): Promise<RatingSnapshot | null> => {
  try {
    console.log(`Fetching rating snapshot for ${symbol}`);
    
    // Use environment API key or fallback
    const apiKey = FMP_API_KEY || FALLBACK_API_KEY;
    
    if (!apiKey) {
      console.error("No API key available for FMP API calls");
      return null;
    }
    
    const url = `${API_BASE_URLS.FMP}/rating/${symbol}?apikey=${apiKey}`;
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
    
    // Use environment API key or fallback
    const apiKey = FMP_API_KEY || FALLBACK_API_KEY;
    
    if (!apiKey) {
      console.error("No API key available for FMP API calls");
      return [];
    }
    
    // The correct endpoint is "grade" (not "grades-news" or "upgrade_downgrade")
    const url = `${API_BASE_URLS.FMP}/grade/${symbol}?limit=${limit}&apikey=${apiKey}`;
    
    console.log(`Making request to: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);
    
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      console.warn(`Error response fetching grade news: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    // Validate and clean the data
    const validData = Array.isArray(data) ? data.filter(item => {
      // Validate and format dates if needed
      if (item.publishedDate) {
        try {
          const date = new Date(item.publishedDate);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date for news item: ${item.publishedDate}`);
            item.publishedDate = null; // Set to null if invalid
          }
        } catch (e) {
          console.warn(`Error parsing date: ${item.publishedDate}`);
          item.publishedDate = null; // Set to null if there's an error
        }
      }
      return true; // Keep the item in the array
    }) : [];
    
    console.log(`Grade news result for ${symbol}:`, validData ? `Found ${validData.length} results` : 'No data');
    return validData || [];
  } catch (error) {
    console.error("Error fetching grade news:", error);
    return [];
  }
};
