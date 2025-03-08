
// Define stock categories for better search results 
export enum StockCategory {
  EXACT_MATCH = "Exact Match",
  COMMON = "Popular Stocks",
  API = "Search Results"
}

// Common ticker type with additional properties
export interface CommonTickerProps {
  symbol: string;
  name: string;
  category?: StockCategory;
}
