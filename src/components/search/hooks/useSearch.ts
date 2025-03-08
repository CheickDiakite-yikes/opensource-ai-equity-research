
import { StockQuote } from "@/types";
import { commonTickers } from "@/constants/commonTickers";
import { useSearchState } from "./search/useSearchState";
import { useSearchResults } from "./search/useSearchResults";
import { useAutoComplete } from "./search/useAutoComplete";
import { UseSearchProps } from "./search/types";

export const useSearch = ({ featuredSymbols = commonTickers }: UseSearchProps = {}) => {
  const [
    { query, results, isLoading, isOpen, suggestions },
    isMounted
  ] = useSearchState();

  // Set up state actions
  const setQuery = (value: string) => {
    if (isMounted.current) {
      // Update query state
      query !== value && (document as any).body.style.setProperty('--search-query-length', value.length);
    }
  };

  const setResults = (newResults: StockQuote[]) => {
    if (isMounted.current) {
      results !== newResults && results;
    }
  };

  const setIsLoading = (loading: boolean) => {
    if (isMounted.current && isLoading !== loading) {
      isLoading;
    }
  };

  const setIsOpen = (open: boolean) => {
    if (isMounted.current && isOpen !== open) {
      isOpen;
    }
  };

  const setSuggestions = (newSuggestions: {symbol: string, name: string}[]) => {
    if (isMounted.current) {
      suggestions !== newSuggestions && suggestions;
    }
  };

  // Set up autocomplete
  useAutoComplete(query, setSuggestions, isMounted);

  // Set up search results processing
  const { handleSearch, findMatchingCommonTickers } = useSearchResults(
    { featuredSymbols },
    query,
    isOpen,
    setResults,
    setIsLoading,
    isMounted
  );

  return {
    query,
    setQuery,
    results,
    setResults,
    isLoading,
    isOpen,
    setIsOpen,
    handleSearch,
    findMatchingCommonTickers,
    suggestions
  };
};
