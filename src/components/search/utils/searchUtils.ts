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
 * Now fully case-insensitive
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
  
  // Special case for Disney (always at the top for 'dis' or 'disney' searches)
  if (lowerQuery === 'dis' || lowerQuery.includes('disney')) {
    const disneyTicker = combinedTickers.find(s => s.symbol === 'DIS');
    if (disneyTicker && !matches.some(m => m.symbol === 'DIS')) {
      matches.push(createCommonTickerQuote(
        disneyTicker.symbol,
        disneyTicker.name,
        StockCategory.EXACT_MATCH
      ));
    }
  }
  
  // First prioritize exact ticker matches (case-insensitive)
  const exactSymbol = combinedTickers.find(s => s.symbol.toUpperCase() === upperQuery);
  if (exactSymbol && !matches.some(m => m.symbol === exactSymbol.symbol)) {
    matches.push(createCommonTickerQuote(
      exactSymbol.symbol, 
      exactSymbol.name, 
      StockCategory.EXACT_MATCH
    ));
  }
  
  // Next check for exact company name matches (case-insensitive)
  const exactCompanyMatch = combinedTickers.find(s => 
    s.name.toLowerCase() === lowerQuery && lowerQuery.length > 2
  );
  if (exactCompanyMatch && !matches.some(m => m.symbol === exactCompanyMatch.symbol)) {
    matches.push(createCommonTickerQuote(
      exactCompanyMatch.symbol,
      exactCompanyMatch.name,
      StockCategory.EXACT_MATCH
    ));
  }
  
  // Priority check for common ticker abbreviations and popular companies
  const commonAbbreviations: Record<string, string[]> = {
    'aapl': ['apple'],
    'msft': ['microsoft'],
    'amzn': ['amazon'],
    'goog': ['google', 'alphabet'],
    'meta': ['facebook', 'fb'],
    'tsla': ['tesla'],
    'nflx': ['netflix'],
    'dis': ['disney', 'walt disney', 'walt'],
    'wmt': ['walmart'],
    'jpm': ['jpmorgan', 'jp morgan'],
    'v': ['visa'],
    'jnj': ['johnson', 'johnson & johnson'],
    'pg': ['procter', 'gamble'],
    'ko': ['coca', 'cola', 'coke'],
    'intc': ['intel'],
    'csco': ['cisco'],
    'ibm': ['international business'],
    'gs': ['goldman', 'sachs'],
    'axp': ['american express']
  };
  
  // Check if query matches any abbreviation key or value
  Object.entries(commonAbbreviations).forEach(([ticker, terms]) => {
    // If searching by ticker abbreviation (case-insensitive)
    if (ticker.includes(lowerQuery) || lowerQuery.includes(ticker)) {
      const matchingTicker = combinedTickers.find(t => t.symbol.toLowerCase() === ticker);
      if (matchingTicker && !matches.some(m => m.symbol === matchingTicker.symbol)) {
        matches.push(createCommonTickerQuote(
          matchingTicker.symbol,
          matchingTicker.name,
          matchingTicker.symbol.toUpperCase() === upperQuery ? StockCategory.EXACT_MATCH : StockCategory.COMMON
        ));
      }
    }
    
    // If searching by company name (case-insensitive)
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
            matchingTicker.symbol.toUpperCase() === upperQuery ? StockCategory.EXACT_MATCH : StockCategory.COMMON
          ));
        }
      }
    });
  });
  
  // Then check for symbols that start with the query (case-insensitive)
  combinedTickers.forEach(({symbol, name}) => {
    if (matches.some(m => m.symbol === symbol)) return; // Skip already added symbols
    
    if (symbol.toUpperCase().startsWith(upperQuery)) {
      matches.push(createCommonTickerQuote(symbol, name, StockCategory.COMMON));
    }
  });
  
  // Then check for company names that start with the query (case-insensitive)
  combinedTickers.forEach(({symbol, name}) => {
    if (matches.some(m => m.symbol === symbol)) return; // Skip already added symbols
    
    if (name.toLowerCase().startsWith(lowerQuery)) {
      matches.push(createCommonTickerQuote(symbol, name, StockCategory.COMMON));
    }
  });
  
  // Check for company names that contain the query (case-insensitive)
  combinedTickers.forEach(({symbol, name}) => {
    if (matches.some(m => m.symbol === symbol)) return; // Skip already added symbols
    
    if (name.toLowerCase().includes(lowerQuery)) {
      matches.push(createCommonTickerQuote(symbol, name, StockCategory.COMMON));
    }
  });
  
  // Then check for symbols that contain the query (case-insensitive)
  combinedTickers.forEach(({symbol, name}) => {
    if (matches.some(m => m.symbol === symbol)) return; // Skip already added symbols
    
    if (symbol.toUpperCase().includes(upperQuery)) {
      matches.push(createCommonTickerQuote(symbol, name, StockCategory.COMMON));
    }
  });
  
  // Sort by match quality and relevance
  return matches.sort((a, b) => {
    // First by category priority
    if (a.category !== b.category) {
      if (a.category === StockCategory.EXACT_MATCH) return -1;
      if (b.category === StockCategory.EXACT_MATCH) return 1;
    }
    
    // Special prioritization for common tickers
    const aSym = a.symbol.toLowerCase();
    const bSym = b.symbol.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Special case for Disney 
    if (lowerQuery === 'dis' || lowerQuery.includes('disney')) {
      if (aSym === 'dis' || aName.includes('disney')) return -1;
      if (bSym === 'dis' || bName.includes('disney')) return 1;
    }
    
    // Check for exact ticker matches
    if (aSym === lowerQuery) return -1;
    if (bSym === lowerQuery) return 1;
    
    // Check for company names that match the query
    const aNameStartsWithQuery = aName.startsWith(lowerQuery);
    const bNameStartsWithQuery = bName.startsWith(lowerQuery);
    
    if (aNameStartsWithQuery && !bNameStartsWithQuery) return -1;
    if (!aNameStartsWithQuery && bNameStartsWithQuery) return 1;
    
    // Then by whether symbols start with the query
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
