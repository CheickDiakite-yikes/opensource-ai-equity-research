
import { fetchWithRetry, handleFetchResponse } from "@/utils/fetch-utils";
import { API_BASE_URLS, FMP_API_KEY } from "@/config/constants";
import { StockQuote } from "@/types";
import { StockCategory } from "@/components/search/types";

interface FmpSearchResult {
  symbol: string;
  name: string;
  currency?: string;
  stockExchange?: string;
  exchange?: string;
  exchangeShortName?: string;
  exchangeFullName?: string;
}

/**
 * Search for stocks using the FMP Symbol Search API
 * Endpoint: https://financialmodelingprep.com/api/v3/search?query={query}
 */
export async function searchSymbols(query: string, limit: number = 20): Promise<FmpSearchResult[]> {
  if (!query || query.length < 1 || !FMP_API_KEY) return [];

  const url = `${API_BASE_URLS.FMP}/search?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${FMP_API_KEY}`;
  
  try {
    const response = await fetchWithRetry(url);
    
    // Handle 401 Unauthorized specifically to avoid repeated failed API calls
    if (response.status === 401) {
      console.warn("API key unauthorized for FMP search. Please check your API key.");
      return [];
    }
    
    return await handleFetchResponse<FmpSearchResult[]>(response, "Failed to search symbols");
  } catch (error) {
    console.error("Error searching symbols:", error);
    return [];
  }
}

/**
 * Search for companies by name using the FMP Name Search API
 * Endpoint: https://financialmodelingprep.com/api/v3/search-name?query={query}
 */
export async function searchCompanyNames(query: string, limit: number = 20): Promise<FmpSearchResult[]> {
  if (!query || query.length < 1 || !FMP_API_KEY) return [];

  const url = `${API_BASE_URLS.FMP}/search-name?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${FMP_API_KEY}`;
  
  try {
    const response = await fetchWithRetry(url);
    
    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      console.warn("API key unauthorized for FMP name search. Please check your API key.");
      return [];
    }
    
    return await handleFetchResponse<FmpSearchResult[]>(response, "Failed to search company names");
  } catch (error) {
    console.error("Error searching company names:", error);
    return [];
  }
}

/**
 * Enhanced search that combines symbol and name search for better results
 * Falls back to local search if API key is missing or invalid
 */
export async function enhancedSymbolSearch(query: string): Promise<StockQuote[]> {
  if (!query || query.length < 1) return [];
  
  // If API key is missing, don't even try API calls
  if (!FMP_API_KEY) {
    console.warn("FMP API key is missing. Using local search only.");
    return [];
  }
  
  try {
    // Run both searches in parallel for better performance
    const [symbolResults, nameResults] = await Promise.all([
      searchSymbols(query),
      searchCompanyNames(query)
    ]);
    
    // If both API calls failed or returned empty results, return empty array
    if (symbolResults.length === 0 && nameResults.length === 0) {
      return [];
    }
    
    // Combine and deduplicate results
    const allResults = [...symbolResults];
    const symbolSet = new Set(symbolResults.map(r => r.symbol));
    
    // Add name search results that aren't already in symbol results
    nameResults.forEach(result => {
      if (!symbolSet.has(result.symbol)) {
        allResults.push(result);
      }
    });
    
    // Convert to StockQuote format
    return allResults.map(result => ({
      symbol: result.symbol,
      name: result.name,
      price: 0,
      changesPercentage: 0,
      change: 0,
      dayLow: 0,
      dayHigh: 0,
      yearHigh: 0,
      yearLow: 0,
      marketCap: 0,
      priceAvg50: 0,
      priceAvg200: 0,
      volume: 0,
      avgVolume: 0,
      exchange: result.exchangeShortName || result.exchange || "UNKNOWN",
      open: 0,
      previousClose: 0,
      eps: 0,
      pe: 0,
      earningsAnnouncement: null,
      sharesOutstanding: 0,
      timestamp: 0,
      isCommonTicker: false,
      category: 
        // Match exact symbols with higher priority
        result.symbol.toUpperCase() === query.toUpperCase() ? StockCategory.EXACT_MATCH :
        // Symbol search results get different category than name search
        symbolResults.some(r => r.symbol === result.symbol) ? StockCategory.API : StockCategory.COMMON
    }));
  } catch (error) {
    console.error("Enhanced symbol search error:", error);
    return [];
  }
}
