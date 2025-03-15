
/**
 * Categories for search results
 */
export enum StockCategory {
  EXACT_MATCH = "Exact Match",
  COMMON = "Popular Stocks",
  API = "Search Results",
  AI = "AI Suggestions"
}

/**
 * Search dropdown section types
 */
export type SearchSection = "recent" | "popular" | "results" | "ai" | "exact";
