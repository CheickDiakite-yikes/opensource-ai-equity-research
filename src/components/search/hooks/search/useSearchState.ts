
import { useState, useRef, useEffect } from "react";
import { StockQuote } from "@/types";
import { SearchState, SearchActions } from "./types";

export const useSearchState = (): [SearchState, SearchActions, React.MutableRefObject<boolean>] => {
  const [query, setQueryState] = useState("");
  const [results, setResultsState] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoadingState] = useState(false);
  const [isOpen, setIsOpenState] = useState(false);
  const [suggestions, setSuggestionsState] = useState<{symbol: string, name: string}[]>([]);
  
  // Track if the component is mounted to prevent state updates after unmounting
  const isMounted = useRef(true);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Create safe state updaters that check if component is mounted
  const setQuery = (value: string) => {
    if (isMounted.current) {
      setQueryState(value);
      (document as any).body.style.setProperty('--search-query-length', value.length);
    }
  };

  const setResults = (newResults: StockQuote[]) => {
    if (isMounted.current) {
      setResultsState(newResults);
    }
  };

  const setIsLoading = (loading: boolean) => {
    if (isMounted.current) {
      setIsLoadingState(loading);
    }
  };

  const setIsOpen = (open: boolean) => {
    if (isMounted.current) {
      setIsOpenState(open);
    }
  };

  const setSuggestions = (newSuggestions: {symbol: string, name: string}[]) => {
    if (isMounted.current) {
      setSuggestionsState(newSuggestions);
    }
  };

  // Create dummy handler for now, will be implemented in useSearchResults
  const handleSearch = (value: string) => {
    setQuery(value);
  };

  // Create dummy finder for now, will be implemented in useSearchResults
  const findMatchingCommonTickers = (value: string): StockQuote[] => {
    return [];
  };

  return [
    { query, results, isLoading, isOpen, suggestions },
    { 
      setQuery, 
      setResults, 
      setIsLoading, 
      setIsOpen, 
      setSuggestions, 
      handleSearch, 
      findMatchingCommonTickers 
    },
    isMounted
  ];
};
