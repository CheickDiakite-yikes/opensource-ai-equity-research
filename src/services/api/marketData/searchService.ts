
import { supabase } from "@/integrations/supabase/client";
import { commonTickers } from "@/constants/commonTickers";
import { type StockQuote } from "@/types";
import { StockCategory } from "@/components/search/types";
import { createCommonTickerQuote } from "@/components/search/utils/searchUtils";

interface CompanyMatch {
  symbol: string;
  name: string;
  score: number;
}

/**
 * More intelligent search using fuzzy matching and scoring
 */
export const getIntelligentSearchResults = async (query: string): Promise<StockQuote[]> => {
  if (!query || query.length < 1) return [];
  
  // Step 1: Generate search patterns
  const upperQuery = query.toUpperCase();
  const lowerQuery = query.toLowerCase();
  
  // Step 2: Score all tickers from our database
  const allMatches: CompanyMatch[] = [];
  
  // Score based on exact symbol match (highest priority)
  const exactSymbolMatch = commonTickers.find(t => t.symbol === upperQuery);
  if (exactSymbolMatch) {
    allMatches.push({
      symbol: exactSymbolMatch.symbol,
      name: exactSymbolMatch.name,
      score: 100 // Maximum score
    });
  }

  // Score symbols that start with the query (high priority)
  commonTickers.forEach(ticker => {
    if (ticker.symbol === upperQuery) return; // Skip exact matches already added
    
    let score = 0;
    
    // Symbol starts with query (high priority)
    if (ticker.symbol.startsWith(upperQuery)) {
      score += 80 - (ticker.symbol.length - upperQuery.length);
    }
    // Symbol contains query
    else if (ticker.symbol.includes(upperQuery)) {
      score += 60 - (ticker.symbol.length - upperQuery.length);
    }
    // Company name starts with query
    else if (ticker.name.toLowerCase().startsWith(lowerQuery)) {
      score += 50 - (ticker.name.length - lowerQuery.length) / 10;
    }
    // Company name contains query
    else if (ticker.name.toLowerCase().includes(lowerQuery)) {
      score += 40 - (ticker.name.length - lowerQuery.length) / 10;
    }
    
    // Acronym matching (e.g. "aapl" matches "Apple")
    const nameWords = ticker.name.split(' ');
    if (nameWords.length > 1) {
      const acronym = nameWords.map(word => word[0]).join('').toLowerCase();
      if (acronym.includes(lowerQuery)) {
        score += 45;
      }
    }
    
    // Industry/Sector terms in name
    const industryTerms = ['tech', 'semiconductor', 'bank', 'oil', 'pharma', 'health', 'retail'];
    for (const term of industryTerms) {
      if (lowerQuery.includes(term) && ticker.name.toLowerCase().includes(term)) {
        score += 30;
      }
    }
    
    // Fuzzy matching for common typos and similar sounding tickers
    const typoMap: Record<string, string[]> = {
      'intc': ['intel', 'integrated'],
      'aapl': ['apple'],
      'msft': ['microsoft'],
      'amzn': ['amazon'],
      'goog': ['google', 'alphabet'],
      'meta': ['facebook', 'fb'],
      'ko': ['cola', 'coke', 'cocacola'],
      'wmt': ['walmart'],
      'nflx': ['netflix'],
      'tsla': ['tesla'],
      // Add more common ticker/name associations
    };
    
    // Check if our query is a key in typoMap and ticker includes the mapped terms
    for (const [key, terms] of Object.entries(typoMap)) {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        for (const term of terms) {
          if (ticker.name.toLowerCase().includes(term)) {
            score += 35;
            break;
          }
        }
      }
    }
    
    // Only include if score is above threshold
    if (score > 0) {
      allMatches.push({
        symbol: ticker.symbol,
        name: ticker.name,
        score
      });
    }
  });
  
  // Sort by score and limit results
  const sortedMatches = allMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
  
  // Convert to StockQuote objects
  const results: StockQuote[] = sortedMatches.map(match => {
    // Determine category based on score and exact match
    let category = StockCategory.COMMON;
    if (match.symbol === upperQuery) {
      category = StockCategory.EXACT_MATCH;
    }
    
    return createCommonTickerQuote(match.symbol, match.name, category);
  });
  
  return results;
};

/**
 * Export from marketData as well
 */
export * from './newsService';
export * from './indicesService'; 
export * from './stockDataService';
export * from './indicesDataService';
