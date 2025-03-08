import { useState, useEffect, useRef, useCallback } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../types";
import { searchStocks } from "@/lib/api/fmpApi";
import { createCommonTickerQuote, findMatchingCommonTickers } from "../utils/searchUtils";
import { commonTickers } from "@/constants/commonTickers";

interface UseSearchProps {
  featuredSymbols?: { symbol: string; name: string }[];
}

export const useSearch = ({ featuredSymbols = commonTickers }: UseSearchProps = {}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{symbol: string, name: string}[]>([]);
  
  // Track if the component is mounted to prevent state updates after unmounting
  const isMounted = useRef(true);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize with featured symbols when dropdown is opened with empty query
  useEffect(() => {
    if (isOpen && query.length === 0 && isMounted.current) {
      const featuredResults = findMatchingCommonTickers("", featuredSymbols);
      setResults(featuredResults);
    }
  }, [isOpen, featuredSymbols]);

  // Generate suggestions for autocomplete
  useEffect(() => {
    if (!isMounted.current) return;
    
    if (query.length > 0) {
      // Find potential matches for autocomplete, looking only at the beginning of symbols
      const autocompleteSuggestions = commonTickers
        .filter(ticker => 
          ticker.symbol.toLowerCase().startsWith(query.toLowerCase()) && 
          ticker.symbol.toLowerCase() !== query.toLowerCase()
        )
        .slice(0, 5);
      
      setSuggestions(autocompleteSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Check for exact match with common tickers
  const findExactMatch = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    return commonTickers.find(ticker => ticker.symbol === upperValue);
  }, []);

  // Process API search results
  const processApiResults = useCallback((
    apiResults: StockQuote[], 
    commonMatches: StockQuote[], 
    exactMatch: StockQuote | undefined
  ) => {
    if (!isMounted.current) return [];
    
    // Add category to API results
    const categorizedApiResults = apiResults.map(result => ({
      ...result,
      category: StockCategory.API,
      isCommonTicker: false
    }));
    
    // Get symbols from API to avoid duplicates
    const apiSymbols = new Set(categorizedApiResults.map(r => r.symbol));
    
    // Filter common tickers to avoid duplicates
    const filteredCommonTickers = commonMatches.filter(
      match => !apiSymbols.has(match.symbol)
    );
    
    // Combine results with exact matches first
    const exactMatches = filteredCommonTickers.filter(t => t.category === StockCategory.EXACT_MATCH);
    const regularCommonTickers = filteredCommonTickers.filter(t => t.category === StockCategory.COMMON);
    
    // Prioritize exact matches, then API results, then regular common tickers
    return [...exactMatches, ...categorizedApiResults, ...regularCommonTickers];
  }, []);

  // Handle empty or failed API results
  const handleNoApiResults = useCallback((
    commonMatches: StockQuote[], 
    exactMatch: { symbol: string; name: string } | undefined, 
    upperValue: string
  ) => {
    if (!isMounted.current) return [];
    
    if (exactMatch) {
      // Keep any exact matches we found earlier
      return commonMatches;
    } 
    
    if (commonMatches.length === 0) {
      // If no common matches, try exact match with uppercase
      const featuredSymbol = featuredSymbols.find(s => s.symbol === upperValue);
      
      if (featuredSymbol) {
        return [createCommonTickerQuote(upperValue, featuredSymbol.name, StockCategory.EXACT_MATCH)];
      } 
      
      // Show featured symbols if no matches
      return findMatchingCommonTickers("", featuredSymbols);
    }
    
    return commonMatches;
  }, [featuredSymbols]);

  const handleSearch = useCallback(async (value: string) => {
    if (!isMounted.current) return;
    
    setQuery(value);
    
    // Always set dropdown to open when user is typing
    setIsOpen(true);
    
    // First check if we have an exact match with a common ticker
    const upperValue = value.toUpperCase();
    const exactCommonMatch = findExactMatch(value);
    
    // Create exact match quote if found
    let exactMatchQuote: StockQuote | undefined;
    if (exactCommonMatch && isMounted.current) {
      exactMatchQuote = createCommonTickerQuote(
        exactCommonMatch.symbol, 
        exactCommonMatch.name, 
        StockCategory.EXACT_MATCH
      );
    }
    
    // Immediately show common tickers even before API call
    const commonTickerMatches = findMatchingCommonTickers(value, featuredSymbols);
    
    if (isMounted.current) {
      if (exactCommonMatch) {
        // If we have an exact match, add other matches below it
        setResults([
          ...(exactMatchQuote ? [exactMatchQuote] : []),
          ...commonTickerMatches.filter(r => r.category !== StockCategory.EXACT_MATCH)
        ]);
      } else {
        setResults(commonTickerMatches);
      }
    }
    
    if (value.length < 1) {
      // Still show the dropdown even with empty query but only with featured symbols
      return;
    }
    
    if (isMounted.current) {
      setIsLoading(true);
    }
    
    try {
      // Then fetch from API for additional results
      const searchResults = await searchStocks(value);
      
      if (!isMounted.current) return;
      
      if (searchResults && searchResults.length > 0) {
        // Process and combine results
        const combinedResults = processApiResults(
          searchResults, 
          commonTickerMatches, 
          exactMatchQuote
        );
        setResults(combinedResults);
      } else {
        // Handle no API results case
        const fallbackResults = handleNoApiResults(
          commonTickerMatches, 
          exactCommonMatch, 
          upperValue
        );
        setResults(fallbackResults);
      }
    } catch (error) {
      console.error("Search error:", error);
      // Silently handle error - don't show error toast as it's disruptive during typing
      
      if (isMounted.current) {
        // Fall back to local results on error
        const fallbackResults = handleNoApiResults(
          commonTickerMatches, 
          exactCommonMatch, 
          upperValue
        );
        setResults(fallbackResults);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [featuredSymbols, findExactMatch, processApiResults, handleNoApiResults]);

  return {
    query,
    setQuery,
    results,
    setResults,
    isLoading,
    isOpen,
    setIsOpen,
    handleSearch,
    findMatchingCommonTickers: useCallback(
      (value: string) => findMatchingCommonTickers(value, featuredSymbols), 
      [featuredSymbols]
    ),
    suggestions
  };
};
