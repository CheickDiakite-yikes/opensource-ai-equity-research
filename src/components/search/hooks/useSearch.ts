
import { useState, useEffect, useRef } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../types";
import { searchStocks } from "@/lib/api/fmpApi";
import { getIntelligentSearchResults } from "@/services/api/marketData/searchService";
import { createCommonTickerQuote, findMatchingCommonTickers, getAllTickers } from "../utils/searchUtils";
import { commonTickers } from "@/constants/commonTickers";
import { toast } from "sonner";

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
  const isInitialRender = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize with featured symbols when dropdown is opened with empty query
  useEffect(() => {
    if (isOpen && query.length === 0 && !isInitialRender.current) {
      const featuredResults = findMatchingCommonTickers("", featuredSymbols);
      setResults(featuredResults);
    }
    
    // Mark that we've handled the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, [isOpen, featuredSymbols, query]);

  // Generate suggestions for autocomplete
  useEffect(() => {
    if (query.length > 0) {
      // Find potential matches for autocomplete
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

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    // Always set dropdown to open when user is typing
    setIsOpen(true);
    
    // First check if we have an exact match with a common ticker
    const upperValue = value.toUpperCase();
    const exactCommonMatch = commonTickers.find(ticker => ticker.symbol === upperValue);
    
    if (exactCommonMatch) {
      const exactMatchQuote = createCommonTickerQuote(
        exactCommonMatch.symbol, 
        exactCommonMatch.name, 
        StockCategory.EXACT_MATCH
      );
      
      if (isMounted.current) {
        setResults([exactMatchQuote]);
      }
    }
    
    // Immediately show common tickers even before API call
    const commonTickerMatches = findMatchingCommonTickers(value, featuredSymbols);
    
    if (exactCommonMatch) {
      // If we have an exact match, add other matches below it
      if (isMounted.current) {
        setResults([
          ...results.filter(r => r.category === StockCategory.EXACT_MATCH),
          ...commonTickerMatches.filter(r => r.category !== StockCategory.EXACT_MATCH)
        ]);
      }
    } else if (isMounted.current) {
      setResults(commonTickerMatches);
    }
    
    if (value.length < 1) {
      // Still show the dropdown even with empty query
      // but only with featured symbols
      return;
    }
    
    if (isMounted.current) {
      setIsLoading(true);
    }
    
    try {
      // Use our new intelligent search for better results
      const intelligentResults = await getIntelligentSearchResults(value);
      
      // Then also fetch from API for additional results
      const apiResults = await searchStocks(value);
      
      if (!isMounted.current) return;
      
      let finalResults: StockQuote[] = [];
      
      // First get exact matches from intelligent results
      const exactMatches = intelligentResults.filter(r => r.category === StockCategory.EXACT_MATCH);
      
      // Next get API results, but don't duplicate symbols from intelligent results
      const intelligentSymbols = new Set(intelligentResults.map(r => r.symbol));
      const filteredApiResults = apiResults
        .filter(r => !intelligentSymbols.has(r.symbol))
        .map(result => ({
          ...result,
          category: StockCategory.API,
          isCommonTicker: false
        }));
      
      // Next get other intelligent results that aren't exact matches
      const otherIntelligentResults = intelligentResults.filter(r => r.category !== StockCategory.EXACT_MATCH);
      
      // Combine results with prioritized ordering
      finalResults = [
        ...exactMatches,
        ...filteredApiResults,
        ...otherIntelligentResults
      ];
      
      if (finalResults.length > 0) {
        setResults(finalResults);
      } else if (exactCommonMatch) {
        // Keep any exact matches we found earlier
        // Don't change the results array if we already have an exact match
      } else if (commonTickerMatches.length === 0) {
        // If no API results and no common matches, try exact match with uppercase
        const featuredSymbol = featuredSymbols.find(s => s.symbol === upperValue);
        
        if (featuredSymbol) {
          setResults([createCommonTickerQuote(upperValue, featuredSymbol.name, StockCategory.EXACT_MATCH)]);
        } else {
          // Show featured symbols if no matches
          setResults(findMatchingCommonTickers("", featuredSymbols));
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      // Silently handle error - don't show error toast as it's disruptive during typing
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    query,
    setQuery,
    results,
    setResults,
    isLoading,
    isOpen,
    setIsOpen,
    handleSearch,
    findMatchingCommonTickers: (value: string) => findMatchingCommonTickers(value, featuredSymbols),
    suggestions
  };
};
