
import { StockQuote } from "@/types";
import { StockCategory } from "../types";
import { commonTickers } from "@/constants/commonTickers";

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
  featuredSymbols: {symbol: string, name: string}[] = commonTickers
): StockQuote[] => {
  // Combine featured symbols with common tickers for a more comprehensive search
  const combinedTickers = [...featuredSymbols];
  
  // Add common tickers if they're not already in featured
  const featuredSymbolSet = new Set(featuredSymbols.map(s => s.symbol));
  commonTickers.forEach(ticker => {
    if (!featuredSymbolSet.has(ticker.symbol)) {
      combinedTickers.push(ticker);
    }
  });
  
  if (!searchQuery) {
    // When no query, show a subset of featured symbols
    return featuredSymbols.slice(0, 10).map(({symbol, name}) => 
      createCommonTickerQuote(symbol, name)
    );
  }
  
  const matches: StockQuote[] = [];
  const upperQuery = searchQuery.toUpperCase();
  const lowerQuery = searchQuery.toLowerCase();
  
  // First prioritize exact ticker matches
  const exactSymbol = combinedTickers.find(s => s.symbol === upperQuery);
  if (exactSymbol) {
    matches.push(createCommonTickerQuote(
      exactSymbol.symbol, 
      exactSymbol.name, 
      StockCategory.EXACT_MATCH
    ));
  }
  
  // Priority check for common ticker abbreviations and popular companies
  // This ensures Disney appears when searching for "dis"
  const commonAbbreviations: Record<string, string[]> = {
    'dis': ['disney', 'walt disney'],
    'aapl': ['apple'],
    'msft': ['microsoft'],
    'amzn': ['amazon'],
    'goog': ['google', 'alphabet'],
    'meta': ['facebook', 'fb'],
    'tsla': ['tesla']
  };
  
  // Check if query matches any abbreviation key or value
  Object.entries(commonAbbreviations).forEach(([ticker, terms]) => {
    // If searching by ticker abbreviation
    if (ticker.includes(lowerQuery) || lowerQuery.includes(ticker)) {
      const matchingTicker = combinedTickers.find(t => t.symbol.toLowerCase() === ticker);
      if (matchingTicker && !matches.some(m => m.symbol === matchingTicker.symbol)) {
        matches.push(createCommonTickerQuote(
          matchingTicker.symbol,
          matchingTicker.name,
          matchingTicker.symbol === upperQuery ? StockCategory.EXACT_MATCH : StockCategory.COMMON
        ));
      }
    }
    
    // If searching by company name
    terms.forEach(term => {
      if (term.includes(lowerQuery) || lowerQuery.includes(term)) {
        const matchingTicker = combinedTickers.find(t => 
          t.symbol.toLowerCase() === ticker || 
          t.name.toLowerCase().includes(term)
        );
        if (matchingTicker && !matches.some(m => m.symbol === matchingTicker.symbol)) {
          matches.push(createCommonTickerQuote(
            matchingTicker.symbol,
            matchingTicker.name,
            matchingTicker.symbol === upperQuery ? StockCategory.EXACT_MATCH : StockCategory.COMMON
          ));
        }
      }
    });
  });
  
  // Then check for symbols that start with the query (second priority)
  combinedTickers.forEach(({symbol, name}) => {
    if (matches.some(m => m.symbol === symbol)) return; // Skip already added symbols
    
    if (symbol.startsWith(upperQuery)) {
      matches.push(createCommonTickerQuote(symbol, name, StockCategory.COMMON));
    }
  });
  
  // Then check for symbols that contain the query or names that contain the query (third priority)
  combinedTickers.forEach(({symbol, name}) => {
    if (matches.some(m => m.symbol === symbol)) return; // Skip already added symbols
    
    if (symbol.includes(upperQuery) || 
        name.toLowerCase().includes(lowerQuery)) {
      matches.push(createCommonTickerQuote(symbol, name, StockCategory.COMMON));
    }
  });
  
  // Sort by symbol length (shorter first) after respecting the priority groups
  return matches.sort((a, b) => {
    // First by category priority
    if (a.category !== b.category) {
      if (a.category === StockCategory.EXACT_MATCH) return -1;
      if (b.category === StockCategory.EXACT_MATCH) return 1;
    }
    
    // Special prioritization for common tickers when they match the query
    const aSym = a.symbol.toLowerCase();
    const bSym = b.symbol.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Special case for Disney and other very popular stocks
    if (lowerQuery === 'dis' || lowerQuery.includes('disney')) {
      if (aSym === 'dis' || aName.includes('disney')) return -1;
      if (bSym === 'dis' || bName.includes('disney')) return 1;
    }
    
    // Check for exact ticker matches
    if (aSym === lowerQuery) return -1;
    if (bSym === lowerQuery) return 1;
    
    // Then by whether they start with the query
    const aStartsWith = aSym.startsWith(lowerQuery);
    const bStartsWith = bSym.startsWith(lowerQuery);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Then by symbol length
    return aSym.length - bSym.length;
  });
};

/**
 * Get all available tickers, combining common tickers with featured symbols
 */
export const getAllTickers = (featuredSymbols: {symbol: string, name: string}[] = []): {symbol: string, name: string}[] => {
  const combined = [...commonTickers];
  
  // Add any featured symbols that aren't in commonTickers
  const commonTickerSymbols = new Set(commonTickers.map(t => t.symbol));
  featuredSymbols.forEach(symbol => {
    if (!commonTickerSymbols.has(symbol.symbol)) {
      combined.push(symbol);
    }
  });
  
  return combined;
};
