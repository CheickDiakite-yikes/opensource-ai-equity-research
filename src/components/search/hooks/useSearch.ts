
import { useState, useEffect } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../types";
import { searchStocks } from "@/lib/api/fmpApi";
import { createCommonTickerQuote, findMatchingCommonTickers } from "../utils/searchUtils";
import { getEnhancedSearchResults } from "@/services/api/searchService";
import { useDebounce } from "@/hooks/useDebounce";

interface UseSearchProps {
  featuredSymbols: { symbol: string; name: string }[];
}

export const useSearch = ({ featuredSymbols }: UseSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<StockQuote[]>([]);
  
  // Debounce the query to avoid making too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Handle search - this is called when user is typing
  const handleSearch = async (value: string) => {
    setQuery(value);
    
    // Always set dropdown to open when user is typing
    setIsOpen(true);
    
    // Immediately show common tickers even before API call
    const commonTickerMatches = findMatchingCommonTickers(value, featuredSymbols);
    
    if (value.length < 2) {
      // For very short queries, just show common tickers
      setResults(commonTickerMatches);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First fetch from regular API
      const searchResults = await searchStocks(value);
      
      // Get AI-powered suggestions in parallel
      const enhancedResults = await getEnhancedSearchResults(value, featuredSymbols);
      setAiSuggestions(enhancedResults.map(r => ({
        ...r,
        category: StockCategory.AI
      })));
      
      if (searchResults && searchResults.length > 0) {
        // Add category to API results
        const categorizedApiResults = searchResults.map(result => ({
          ...result,
          category: StockCategory.API,
          isCommonTicker: false
        }));
        
        // Get symbols from API to avoid duplicates
        const apiSymbols = new Set(categorizedApiResults.map(r => r.symbol));
        
        // Filter common tickers to avoid duplicates
        const filteredCommonTickers = commonTickerMatches.filter(
          match => !apiSymbols.has(match.symbol)
        );
        
        // Also filter AI suggestions to avoid duplicates with API results
        const filteredAiSuggestions = enhancedResults
          .filter(suggestion => !apiSymbols.has(suggestion.symbol))
          .map(r => ({
            ...r,
            category: StockCategory.AI
          }));
        
        // Combine results with exact matches first
        const exactMatches = filteredCommonTickers.filter(t => t.category === StockCategory.EXACT_MATCH);
        const regularCommonTickers = filteredCommonTickers.filter(t => t.category === StockCategory.COMMON);
        
        const combinedResults = [
          ...exactMatches, 
          ...categorizedApiResults, 
          ...filteredAiSuggestions,
          ...regularCommonTickers
        ];
        
        setResults(combinedResults);
      } else {
        // If no API results, use common matches and AI suggestions
        const exactMatches = commonTickerMatches.filter(t => t.category === StockCategory.EXACT_MATCH);
        const regularCommonTickers = commonTickerMatches.filter(t => t.category === StockCategory.COMMON);
        
        const combinedResults = [
          ...exactMatches,
          ...enhancedResults.map(r => ({
            ...r,
            category: StockCategory.AI
          })),
          ...regularCommonTickers
        ];
        
        // If no results at all, try to create an exact match with uppercase
        if (combinedResults.length === 0) {
          const upperValue = value.toUpperCase();
          const featuredSymbol = featuredSymbols.find(s => s.symbol === upperValue);
          
          if (featuredSymbol) {
            setResults([createCommonTickerQuote(upperValue, featuredSymbol.name, StockCategory.EXACT_MATCH)]);
          } else {
            // Show featured symbols if no matches
            setResults(findMatchingCommonTickers("", featuredSymbols));
          }
        } else {
          setResults(combinedResults);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      // Silently handle error - don't show error toast as it's disruptive during typing
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    setResults,
    isLoading,
    isOpen,
    setIsOpen,
    handleSearch,
    aiSuggestions,
    findMatchingCommonTickers: (value: string) => findMatchingCommonTickers(value, featuredSymbols)
  };
};
