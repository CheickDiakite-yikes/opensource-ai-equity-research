
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
      score += 85 - (ticker.symbol.length - upperQuery.length);
    }
    // Symbol contains query
    else if (ticker.symbol.includes(upperQuery)) {
      score += 65 - (ticker.symbol.length - upperQuery.length);
    }
    // Company name starts with query
    else if (ticker.name.toLowerCase().startsWith(lowerQuery)) {
      score += 60 - (ticker.name.length - lowerQuery.length) / 10;
    }
    // Company name contains query
    else if (ticker.name.toLowerCase().includes(lowerQuery)) {
      score += 45 - (ticker.name.length - lowerQuery.length) / 10;
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
      if (lowerQuery.includes(term) && ticker.name.toLowerCase().includes(term)) {
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
      'dis': ['disney'],
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
    
    // Check if our query is a key in typoMap and ticker includes the mapped terms
    for (const [key, terms] of Object.entries(typoMap)) {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        for (const term of terms) {
          if (ticker.name.toLowerCase().includes(term)) {
            score += 40;
            break;
          }
        }
      }
    }
    
    // Special case for semiconductor companies
    const semiconductorTerms = ['chip', 'semiconductor', 'processor', 'gpu', 'cpu'];
    const semiconductorCompanies = ['nvidia', 'intel', 'amd', 'qualcomm', 'broadcom', 'micron', 'tsmc', 'applied materials', 'lam research', 'kla'];
    
    for (const term of semiconductorTerms) {
      if (lowerQuery.includes(term)) {
        for (const company of semiconductorCompanies) {
          if (ticker.name.toLowerCase().includes(company)) {
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
            
            if (ticker.symbol.toLowerCase().includes(typoVariation) || 
                ticker.name.toLowerCase().includes(typoVariation)) {
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

// Re-export from marketData as well
export * from './newsService';
export * from './indicesService'; 
export * from './stockDataService';
export * from './indicesDataService';
