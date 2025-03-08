
import { StockQuote } from "@/types";
import { commonTickers } from "@/constants/commonTickers";
import { useSearchState } from "./search/useSearchState";
import { useSearchResults } from "./search/useSearchResults";
import { useAutoComplete } from "./search/useAutoComplete";
import { UseSearchProps } from "./search/types";

export const useSearch = ({ featuredSymbols = commonTickers }: UseSearchProps = {}) => {
  const [
    { query, results, isLoading, isOpen, suggestions },
    actions,
    isMounted
  ] = useSearchState();

  // Set up autocomplete
  useAutoComplete(query, actions.setSuggestions, isMounted);

  // Set up search results processing
  const { handleSearch, findMatchingCommonTickers } = useSearchResults(
    { featuredSymbols },
    query,
    isOpen,
    actions.setResults,
    actions.setIsLoading,
    isMounted
  );

  // Override the dummy handlers with real implementations
  actions.handleSearch = handleSearch;
  actions.findMatchingCommonTickers = findMatchingCommonTickers;

  return {
    query,
    setQuery: actions.setQuery,
    results,
    setResults: actions.setResults,
    isLoading,
    isOpen,
    setIsOpen: actions.setIsOpen,
    handleSearch,
    findMatchingCommonTickers,
    suggestions
  };
};
