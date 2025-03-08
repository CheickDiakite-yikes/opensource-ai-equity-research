
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
import { API_BASE_URLS, FMP_API_KEY } from "../../../../supabase/functions/_shared/constants";
import { fetchWithRetry, handleFetchResponse } from "../../../../supabase/functions/_shared/fetch-utils";

/**
 * Fetch stock rating snapshot from FMP API
 */
export const fetchRatingSnapshot = async (symbol: string): Promise<RatingSnapshot | null> => {
  try {
    console.log(`Fetching rating snapshot for ${symbol}`);
    const url = `${API_BASE_URLS.FMP}/rating-snapshot/${symbol}?apikey=${FMP_API_KEY}`;
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
    // Updated endpoint from 'grade-news' to 'grades-news' as per the API documentation
    const url = `${API_BASE_URLS.FMP}/grades-news?symbol=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`;
    const response = await fetchWithRetry(url);
    const data = await handleFetchResponse<GradeNews[]>(response);
    
    console.log(`Grade news result for ${symbol}:`, data ? `Found ${data.length} results` : 'No data');
    return data || [];
  } catch (error) {
    console.error("Error fetching grade news:", error);
    return [];
  }
};
