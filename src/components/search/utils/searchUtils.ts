
import { StockQuote } from "@/types";
import { StockCategory } from "../types";

/**
 * Create a stock quote object for common tickers
 */
export const createCommonTickerQuote = (
  symbol: string, 
  name: string, 
  category: StockCategory = StockCategory.COMMON
): StockQuote => {
  return {
    symbol,
    name,
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
    exchange: "NYSE/NASDAQ",
    open: 0,
    previousClose: 0,
    eps: 0,
    pe: 0,
    earningsAnnouncement: null,
    sharesOutstanding: 0,
    timestamp: 0,
    isCommonTicker: true,
    category
  };
};

/**
 * Find matching common tickers with categorization
 */
export const findMatchingCommonTickers = (
  searchQuery: string,
  featuredSymbols: {symbol: string, name: string}[]
): StockQuote[] => {
  if (!searchQuery) {
    // When no query, show all featured symbols
    return featuredSymbols.map(({symbol, name}) => 
      createCommonTickerQuote(symbol, name)
    );
  }
  
  const matches: StockQuote[] = [];
  const upperQuery = searchQuery.toUpperCase();
  
  // First check for exact match - highest priority
  const featuredSymbol = featuredSymbols.find(s => s.symbol === upperQuery);
  if (featuredSymbol) {
    matches.push(createCommonTickerQuote(
      featuredSymbol.symbol, 
      featuredSymbol.name, 
      StockCategory.EXACT_MATCH
    ));
  }
  
  // Then add other matching symbols
  featuredSymbols.forEach(({symbol, name}) => {
    if (symbol === upperQuery) return; // Skip exact matches we already added
    
    if (symbol.includes(upperQuery) || 
        name.toLowerCase().includes(searchQuery.toLowerCase())) {
      matches.push(createCommonTickerQuote(symbol, name));
    }
  });
  
  return matches;
};
