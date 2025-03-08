
import { commonTickers } from "@/constants/commonTickers";
import { type StockQuote } from "@/types";
import { StockCategory } from "@/components/search/types";
import { createCommonTickerQuote } from "@/components/search/utils/searchUtils";
import { enhancedSymbolSearch } from "./fmpSearchService";

interface CompanyMatch {
  symbol: string;
  name: string;
  score: number;
}

/**
 * More intelligent search using fuzzy matching and scoring
 * Enhanced with direct API integration and fallback to local search
 * Now fully case-insensitive
 */
export const getIntelligentSearchResults = async (query: string): Promise<StockQuote[]> => {
  if (!query || query.length < 1) return [];
  
  // Step 1: Generate search patterns
  const upperQuery = query.toUpperCase();
  const lowerQuery = query.toLowerCase();
  
  // Step 2: Score all tickers from our database
  const allMatches: CompanyMatch[] = [];
  
  // Special case for Disney - always prioritize it highly when searching for "dis" or "disney"
  if (lowerQuery === 'dis' || lowerQuery.includes('disney')) {
    const disneyTicker = commonTickers.find(t => t.symbol === 'DIS');
    if (disneyTicker) {
      allMatches.push({
        symbol: disneyTicker.symbol,
        name: disneyTicker.name,
        score: 100 // Maximum score
      });
    }
  }
  
  // Score based on exact symbol match (highest priority) - case insensitive
  const exactSymbolMatch = commonTickers.find(t => t.symbol.toUpperCase() === upperQuery);
  if (exactSymbolMatch) {
    // If not already added (like Disney special case)
    if (!allMatches.some(m => m.symbol === exactSymbolMatch.symbol)) {
      allMatches.push({
        symbol: exactSymbolMatch.symbol,
        name: exactSymbolMatch.name,
        score: 100 // Maximum score
      });
    }
  }
  
  // Score based on exact company name match (high priority) - case insensitive
  const exactNameMatch = commonTickers.find(t => 
    t.name.toLowerCase() === lowerQuery && lowerQuery.length > 2
  );
  if (exactNameMatch) {
    // If not already added
    if (!allMatches.some(m => m.symbol === exactNameMatch.symbol)) {
      allMatches.push({
        symbol: exactNameMatch.symbol,
        name: exactNameMatch.name,
        score: 95 // Very high score, just below exact symbol match
      });
    }
  }

  // Score all remaining tickers
  commonTickers.forEach(ticker => {
    if (allMatches.some(m => m.symbol === ticker.symbol)) return; // Skip already added matches
    
    let score = 0;
    const tickerSymbolLower = ticker.symbol.toLowerCase();
    const tickerNameLower = ticker.name.toLowerCase();
    
    // Symbol starts with query (high priority)
    if (tickerSymbolLower.startsWith(lowerQuery)) {
      score += 85 - (ticker.symbol.length - lowerQuery.length);
    }
    // Symbol contains query
    else if (tickerSymbolLower.includes(lowerQuery)) {
      score += 65 - (ticker.symbol.length - lowerQuery.length);
    }
    // Company name starts with query
    else if (tickerNameLower.startsWith(lowerQuery)) {
      score += 70 - (ticker.name.length - lowerQuery.length) / 10;
    }
    // Company name contains query
    else if (tickerNameLower.includes(lowerQuery)) {
      score += 55 - (ticker.name.length - lowerQuery.length) / 10;
    }
    
    // Acronym matching (e.g. "aapl" matches "Apple")
    const nameWords = ticker.name.split(' ');
    if (nameWords.length > 1) {
      const acronym = nameWords.map(word => word[0]).join('').toLowerCase();
      if (acronym.includes(lowerQuery)) {
        score += 50;
      }
    }
    
    // Industry/Sector terms in name
    const industryTerms = ['tech', 'semiconductor', 'bank', 'oil', 'pharma', 'health', 'retail', 'auto', 'electric', 
                          'energy', 'software', 'fintech', 'financial', 'media', 'streaming', 'cloud', 'ai'];
    for (const term of industryTerms) {
      if (lowerQuery.includes(term) && tickerNameLower.includes(term)) {
        score += 40;
      }
    }
    
    // Enhanced fuzzy matching for common typos and similar sounding tickers
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
      'nvda': ['nvidia'],
      'jpm': ['jpmorgan', 'morgan'],
      'pg': ['procter', 'gamble', 'proctor'],
      'unh': ['united', 'health'],
      'dis': ['disney', 'walt'],
      'hd': ['home', 'depot'],
      'bac': ['bank', 'america'],
      'abbv': ['abbvie'],
      'xom': ['exxon', 'mobil'],
      'crm': ['salesforce', 'sales'],
      'csco': ['cisco'],
      'amd': ['advanced', 'micro', 'devices'],
      'hood': ['robinhood', 'robin'],
      'coin': ['coinbase', 'crypto'],
      'sofi': ['social', 'finance'],
      'v': ['visa'],
      'ma': ['mastercard'],
      'adbe': ['adobe'],
      'uber': ['rideshare'],
      't': ['att', 'telephone'],
      'vz': ['verizon'],
      'gs': ['goldman', 'sachs'],
      'f': ['ford'],
      'gm': ['general', 'motors'],
      'ba': ['boeing'],
      'cat': ['caterpillar'],
      'ibm': ['international', 'business', 'machines'],
      'mcd': ['mcdonald'],
    };
    
    // Check if our query matches any key in typoMap or if ticker name includes the mapped terms
    for (const [key, terms] of Object.entries(typoMap)) {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        for (const term of terms) {
          if (tickerNameLower.includes(term)) {
            score += 40;
            break;
          }
        }
      }
      
      // Also check if query matches any of the terms and ticker symbol matches the key
      for (const term of terms) {
        if (lowerQuery.includes(term) && tickerSymbolLower === key) {
          score += 45;
          break;
        }
      }
    }

    // Special case for Disney 
    if (ticker.symbol === 'DIS' && (lowerQuery.includes('disney') || lowerQuery === 'dis')) {
      score += 90; // Very high priority when searching for "disney"
    }
    
    // Special case for semiconductor companies
    const semiconductorTerms = ['chip', 'semiconductor', 'processor', 'gpu', 'cpu'];
    const semiconductorCompanies = ['nvidia', 'intel', 'amd', 'qualcomm', 'broadcom', 'micron', 'tsmc', 'applied materials', 'lam research', 'kla'];
    
    for (const term of semiconductorTerms) {
      if (lowerQuery.includes(term)) {
        for (const company of semiconductorCompanies) {
          if (tickerNameLower.includes(company)) {
            score += 35;
            break;
          }
        }
      }
    }
    
    // Phonetic similarity - simple implementation
    // E.g., "fizer" should match "pfizer", "googl" should match "google"
    const simplifyString = (str: string): string => {
      return str.toLowerCase()
        .replace(/ph/g, 'f')
        .replace(/[aeiou]+/g, '') // Remove vowels for consonant matching
        .replace(/[^a-z]/g, '');  // Remove non-alphabetic chars
    };
    
    const simplifiedQuery = simplifyString(lowerQuery);
    const simplifiedSymbol = simplifyString(ticker.symbol);
    const simplifiedName = simplifyString(ticker.name);
    
    if (simplifiedSymbol.includes(simplifiedQuery) || simplifiedQuery.includes(simplifiedSymbol)) {
      score += 30;
    }
    
    if (simplifiedName.includes(simplifiedQuery)) {
      score += 25;
    }
    
    // Handle keyboard proximity typos (adjacent keys)
    const keyboardMap: Record<string, string[]> = {
      'a': ['s', 'z', 'q', 'w'],
      'b': ['v', 'n', 'g', 'h'],
      'c': ['x', 'v', 'd', 'f'],
      'd': ['s', 'f', 'e', 'r'],
      'e': ['w', 'r', 'd', 'f'],
      'f': ['d', 'g', 'r', 't'],
      'g': ['f', 'h', 't', 'y'],
      'h': ['g', 'j', 'y', 'u'],
      'i': ['u', 'o', 'k', 'l'],
      'j': ['h', 'k', 'u', 'i'],
      'k': ['j', 'l', 'i', 'o'],
      'l': ['k', ';', 'o', 'p'],
      'm': ['n', ',', 'j', 'k'],
      'n': ['b', 'm', 'h', 'j'],
      'o': ['i', 'p', 'k', 'l'],
      'p': ['o', '[', 'l', ';'],
      'q': ['w', 'a', '1', '2'],
      'r': ['e', 't', 'd', 'f'],
      's': ['a', 'd', 'w', 'e'],
      't': ['r', 'y', 'f', 'g'],
      'u': ['y', 'i', 'h', 'j'],
      'v': ['c', 'b', 'f', 'g'],
      'w': ['q', 'e', 'a', 's'],
      'x': ['z', 'c', 's', 'd'],
      'y': ['t', 'u', 'g', 'h'],
      'z': ['a', 'x', 's', 'd']
    };
    
    // Generate keyboard-adjacent variations of the query
    if (lowerQuery.length > 1) {
      for (let i = 0; i < lowerQuery.length; i++) {
        const char = lowerQuery[i];
        if (keyboardMap[char]) {
          for (const adjacentChar of keyboardMap[char]) {
            const typoVariation = lowerQuery.substring(0, i) + adjacentChar + lowerQuery.substring(i + 1);
            
            if (tickerSymbolLower.includes(typoVariation) || 
                tickerNameLower.includes(typoVariation)) {
              score += 20;
              break;
            }
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
  
  // Convert to StockQuote objects for local results
  const localResults: StockQuote[] = sortedMatches.map(match => {
    // Determine category based on score and exact match
    let category = StockCategory.COMMON;
    if (match.symbol.toUpperCase() === upperQuery) {
      category = StockCategory.EXACT_MATCH;
    }
    // Special case for Disney - make it an exact match when searching for 'dis'
    else if (match.symbol === 'DIS' && (lowerQuery === 'dis' || lowerQuery.includes('disney'))) {
      category = StockCategory.EXACT_MATCH;
    }
    else if (match.score >= 95) {
      category = StockCategory.EXACT_MATCH;
    }
    
    return createCommonTickerQuote(match.symbol, match.name, category);
  });
  
  try {
    // Also fetch from the FMP API directly for more comprehensive search
    const apiResults = await enhancedSymbolSearch(query);
    
    // If API results are empty (possibly due to invalid API key), just return local results
    if (apiResults.length === 0) {
      console.log("API search returned no results, using local search only");
      return localResults;
    }
    
    // Combine local and API results, removing duplicates
    const combinedResults: StockQuote[] = [...localResults];
    const localSymbols = new Set(localResults.map(r => r.symbol));
    
    apiResults.forEach(result => {
      if (!localSymbols.has(result.symbol)) {
        combinedResults.push(result);
      }
    });
    
    // Sort by category with special handling
    return combinedResults.sort((a, b) => {
      // First, handle special case for Disney
      if (lowerQuery === 'dis' || lowerQuery.includes('disney')) {
        if (a.symbol === 'DIS') return -1;
        if (b.symbol === 'DIS') return 1;
      }
      
      // Exact matches first
      if (a.category === StockCategory.EXACT_MATCH && b.category !== StockCategory.EXACT_MATCH) return -1;
      if (a.category !== StockCategory.EXACT_MATCH && b.category === StockCategory.EXACT_MATCH) return 1;
      
      // Then common tickers
      if (a.category === StockCategory.COMMON && b.category !== StockCategory.COMMON) return -1;
      if (a.category !== StockCategory.COMMON && b.category === StockCategory.COMMON) return 1;
      
      // Then by symbol
      return a.symbol.localeCompare(b.symbol);
    });
  } catch (error) {
    console.error("Error fetching API results:", error);
    // Fallback to local results if API fails
    return localResults;
  }
};

// Re-export from marketData as well
export * from './newsService';
export * from './indicesService'; 
export * from './stockDataService';
export * from './indicesDataService';
