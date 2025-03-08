
import { useState, useEffect, KeyboardEvent } from "react";
import { StockQuote } from "@/types";

interface UseKeyboardNavigationProps {
  results: StockQuote[];
  query: string;
  suggestions: {symbol: string, name: string}[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSearch: (value: string) => void;
  handleSelectStock: (symbol: string) => void;
}

export const useKeyboardNavigation = ({
  results,
  query,
  suggestions,
  isOpen,
  setIsOpen,
  handleSearch,
  handleSelectStock
}: UseKeyboardNavigationProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const allResults = [...results];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
      setIsOpen(true);
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
      setIsOpen(true);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allResults.length) {
        // Select the currently active item
        handleSelectStock(allResults[activeIndex].symbol);
      } else if (query.trim() !== '') {
        // If there's a query but no active selection, use the first result
        if (allResults.length > 0) {
          handleSelectStock(allResults[0].symbol);
        } else {
          // Try to navigate to the exact query as a symbol
          handleSelectStock(query.toUpperCase());
        }
      }
    } 
    else if (e.key === 'Escape') {
      setIsOpen(false);
    } 
    else if (e.key === 'Tab') {
      // On Tab, complete with suggestion if available
      if (suggestions.length > 0) {
        e.preventDefault();
        handleSearch(suggestions[0].symbol);
      }
    }
  };

  return {
    activeIndex,
    handleKeyDown
  };
};
