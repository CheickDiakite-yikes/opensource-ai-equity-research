
import { toast } from "sonner";
import { StockQuote } from "@/types";

export interface AIStockSuggestion {
  symbol: string;
  name: string;
}

/**
 * Get AI-powered stock suggestions
 */
export async function getAIStockSuggestions(
  query: string, 
  featuredSymbols: {symbol: string, name: string}[]
): Promise<AIStockSuggestion[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch('/api/ai-stock-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        existingSymbols: featuredSymbols
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn("AI suggestions error:", data.error);
      return [];
    }
    
    return data.suggestions || [];
  } catch (error) {
    console.error(`Error fetching AI suggestions for "${query}":`, error);
    // Don't show toast for these errors as they're not critical
    return [];
  }
}

/**
 * Get combined search results from multiple sources
 */
export async function getEnhancedSearchResults(
  query: string,
  featuredSymbols: {symbol: string, name: string}[]
): Promise<StockQuote[]> {
  try {
    // Get AI suggestions
    const aiSuggestions = await getAIStockSuggestions(query, featuredSymbols);
    
    // TODO: Implement API search results when available
    
    // Convert AI suggestions to StockQuote format
    return aiSuggestions.map(suggestion => ({
      symbol: suggestion.symbol,
      name: suggestion.name,
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
      exchange: "AI Suggestion",
      open: 0,
      previousClose: 0,
      eps: 0,
      pe: 0,
      earningsAnnouncement: null,
      sharesOutstanding: 0,
      timestamp: 0,
      isCommonTicker: false,
      category: "AI Suggestions"
    }));
  } catch (error) {
    console.error(`Error in enhanced search for "${query}":`, error);
    return [];
  }
}
