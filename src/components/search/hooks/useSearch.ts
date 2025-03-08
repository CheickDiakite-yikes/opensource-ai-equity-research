
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isOpen && query.length === 0) {
      const featuredResults = findMatchingCommonTickers("", featuredSymbols);
      setResults(featuredResults);
    }
  }, [isOpen, query, featuredSymbols]);

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
      setResults([exactMatchQuote]);
    }
    
    // Immediately show common tickers even before API call
    const commonTickerMatches = findMatchingCommonTickers(value, featuredSymbols);
    
    if (exactCommonMatch) {
      // If we have an exact match, add other matches below it
      setResults([
        ...results.filter(r => r.category === StockCategory.EXACT_MATCH),
        ...commonTickerMatches.filter(r => r.category !== StockCategory.EXACT_MATCH)
      ]);
    } else {
      setResults(commonTickerMatches);
    }
    
    if (value.length < 1) {
      // Still show the dropdown even with empty query
      // but only with featured symbols
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Then fetch from API for additional results
      const searchResults = await searchStocks(value);
      
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
        
        // Combine results with exact matches first
        const exactMatches = filteredCommonTickers.filter(t => t.category === StockCategory.EXACT_MATCH);
        const regularCommonTickers = filteredCommonTickers.filter(t => t.category === StockCategory.COMMON);
        
        // Prioritize exact matches, then API results, then regular common tickers
        const combinedResults = [...exactMatches, ...categorizedApiResults, ...regularCommonTickers];
        setResults(combinedResults);
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
      setIsLoading(false);
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
