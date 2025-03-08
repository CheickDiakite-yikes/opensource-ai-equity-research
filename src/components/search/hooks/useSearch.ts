
import { useState, useEffect } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../types";
import { searchStocks } from "@/lib/api/fmpApi";
import { createCommonTickerQuote, findMatchingCommonTickers } from "../utils/searchUtils";

interface UseSearchProps {
  featuredSymbols: { symbol: string; name: string }[];
}

export const useSearch = ({ featuredSymbols }: UseSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    // Always set dropdown to open when user is typing
    setIsOpen(true);
    
    // Immediately show common tickers even before API call
    const commonTickerMatches = findMatchingCommonTickers(value, featuredSymbols);
    setResults(commonTickerMatches);
    
    if (value.length < 1) {
      // Still show the dropdown even with empty query
      // but only with featured symbols
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Then fetch from API
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
        
        const combinedResults = [...exactMatches, ...categorizedApiResults, ...regularCommonTickers];
        setResults(combinedResults);
      } else if (commonTickerMatches.length === 0) {
        // If no API results and no common matches, try exact match with uppercase
        const upperValue = value.toUpperCase();
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
    findMatchingCommonTickers: (value: string) => findMatchingCommonTickers(value, featuredSymbols)
  };
};
