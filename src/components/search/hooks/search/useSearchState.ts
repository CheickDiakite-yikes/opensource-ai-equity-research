
import { useState, useRef, useEffect } from "react";
import { StockQuote } from "@/types";
import { SearchState } from "./types";

export const useSearchState = (): [SearchState, React.MutableRefObject<boolean>] => {
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

  return [
    { query, results, isLoading, isOpen, suggestions },
    isMounted
  ];
};
