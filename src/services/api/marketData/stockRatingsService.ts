
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
import { API_BASE_URLS, FMP_API_KEY } from "../../../../supabase/functions/_shared/constants";
import { fetchWithRetry, handleFetchResponse } from "../../../../supabase/functions/_shared/fetch-utils";

// Fallback API key to use when environment variable is not available
const FALLBACK_API_KEY = "d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg";

/**
 * Fetch stock rating snapshot from FMP API
 * Endpoint: /rating/{symbol}
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
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URLS.FMP}/rating/${symbol}?apikey=${apiKey}&_nocache=${timestamp}`;
    console.log(`Making request to: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);
    
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      console.warn(`Error response fetching rating snapshot: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`No rating snapshot data found for ${symbol}`);
      return null;
    }
    
    // Verify that the returned data is for the requested symbol
    if (data[0].symbol && data[0].symbol.toUpperCase() !== symbol.toUpperCase()) {
      console.error(`Symbol mismatch: requested ${symbol} but received ${data[0].symbol}`);
      return null;
    }
    
    // Log the first item to verify we're getting real, unique data
    console.log(`Rating snapshot for ${symbol}:`, {
      rating: data[0].rating,
      symbol: data[0].symbol,
      scores: {
        overall: data[0].ratingScore || data[0].overallScore,
        dcf: data[0].dcfScore || data[0].discountedCashFlowScore,
        roe: data[0].roeScore || data[0].returnOnEquityScore,
        roa: data[0].roaScore || data[0].returnOnAssetsScore
      }
    });
    
    // Map API response to our expected type
    const ratingSnapshot: RatingSnapshot = {
      symbol: data[0].symbol || symbol,
      rating: data[0].rating || 'N/A',
      overallScore: data[0].ratingScore || data[0].overallScore || 0,
      discountedCashFlowScore: data[0].dcfScore || data[0].discountedCashFlowScore || 0,
      returnOnEquityScore: data[0].roeScore || data[0].returnOnEquityScore || 0,
      returnOnAssetsScore: data[0].roaScore || data[0].returnOnAssetsScore || 0,
      debtToEquityScore: data[0].deScore || data[0].debtToEquityScore || 0,
      priceToEarningsScore: data[0].peScore || data[0].priceToEarningsScore || 0,
      priceToBookScore: data[0].pbScore || data[0].priceToBookScore || 0
    };
    
    return ratingSnapshot;
  } catch (error) {
    console.error("Error fetching rating snapshot:", error);
    return null;
  }
};

/**
 * Fetch stock grade news from FMP API
 * Endpoint: /grade/{symbol}
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
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URLS.FMP}/grade/${symbol}?limit=${limit}&apikey=${apiKey}&_nocache=${timestamp}`;
    
    console.log(`Making request to: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);
    
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      console.warn(`Error response fetching grade news: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    // Verify we have valid data for the requested symbol
    if (Array.isArray(data) && data.length > 0 && data[0].symbol) {
      const dataSymbol = data[0].symbol.toUpperCase();
      const requestedSymbol = symbol.toUpperCase();
      
      if (dataSymbol !== requestedSymbol) {
        console.error(`Symbol mismatch in grade news: requested ${requestedSymbol} but received ${dataSymbol}`);
        return [];
      }
    }
    
    // Validate and normalize data format
    const validData = Array.isArray(data) ? data.map(item => {
      // Use the API-provided date fields, handling possible field name variants
      const newsItem: GradeNews = {
        symbol: item.symbol || symbol,
        publishedDate: item.date || item.publishedDate || new Date().toISOString(),
        gradingCompany: item.gradingCompany || item.company || "Unknown Analyst",
        previousGrade: item.previousGrade || "",
        newGrade: item.newGrade || "",
        action: item.action || "",
        newsURL: item.newsURL,
        newsTitle: item.newsTitle,
        newsBaseURL: item.newsBaseURL,
        newsPublisher: item.newsPublisher,
        priceWhenPosted: item.priceWhenPosted
      };
      
      // Validate date format
      try {
        const date = new Date(newsItem.publishedDate);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date format for news item: ${newsItem.publishedDate}`);
          newsItem.publishedDate = new Date().toISOString();
        }
      } catch (e) {
        console.warn(`Error parsing date: ${newsItem.publishedDate}`);
        newsItem.publishedDate = new Date().toISOString();
      }
      
      return newsItem;
    }) : [];
    
    console.log(`Grade news result for ${symbol}:`, validData ? `Found ${validData.length} results` : 'No data');
    return validData || [];
  } catch (error) {
    console.error("Error fetching grade news:", error);
    return [];
  }
};
