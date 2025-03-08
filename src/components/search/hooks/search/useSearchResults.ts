
import { useCallback, useEffect } from "react";
import { StockQuote } from "@/types";
import { useLocalSearch } from "./useLocalSearch";
import { useApiSearch } from "./useApiSearch";
import { useResultProcessors } from "./useResultProcessors";
import { UseSearchProps } from "./types";

interface SearchResultHandlers {
  handleSearch: (value: string) => Promise<void>;
  findMatchingCommonTickers: (value: string) => StockQuote[];
}

export const useSearchResults = (
  { featuredSymbols }: UseSearchProps,
  query: string,
  isOpen: boolean,
  setResults: (results: StockQuote[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  isMounted: React.MutableRefObject<boolean>
): SearchResultHandlers => {
  const findLocalMatchingTickers = useLocalSearch(featuredSymbols);
  const performApiSearch = useApiSearch(query, featuredSymbols, setIsLoading, isMounted);
  const { processApiResults, handleNoApiResults, createExactMatchQuote } = useResultProcessors(
    featuredSymbols,
    isMounted
  );

  useEffect(() => {
    if (isOpen && query.length === 0 && isMounted.current) {
      const featuredResults = findLocalMatchingTickers("");
      setResults(featuredResults);
    }
  }, [isOpen, featuredSymbols, query, setResults, findLocalMatchingTickers]);

  const handleSearch = useCallback(async (value: string) => {
    if (!isMounted.current) return;

    const upperValue = value.toUpperCase();
    const { exactMatch: exactCommonMatch, commonTickerMatches } = findLocalMatchingTickers(value);

    let exactMatchQuote: StockQuote | undefined = createExactMatchQuote(exactCommonMatch);

    if (isMounted.current) {
      if (exactCommonMatch) {
        setResults([
          ...(exactMatchQuote ? [exactMatchQuote] : []),
          ...commonTickerMatches.filter(r => r.category !== "Exact Match")
        ]);
      } else {
        setResults(commonTickerMatches);
      }
    }

    if (value.length < 1) {
      return;
    }

    const searchResults = await performApiSearch();

    if (!isMounted.current) return;

    if (searchResults) {
      const combinedResults = processApiResults(
        searchResults,
        commonTickerMatches,
        exactMatchQuote
      );
      setResults(combinedResults);
    } else {
      const fallbackResults = handleNoApiResults(
        commonTickerMatches,
        exactCommonMatch,
        upperValue
      );
      setResults(fallbackResults);
    }
  }, [
    featuredSymbols,
    findLocalMatchingTickers,
    processApiResults,
    handleNoApiResults,
    performApiSearch,
    createExactMatchQuote,
    setResults,
    isMounted
  ]);

  return {
    handleSearch,
    findMatchingCommonTickers: useCallback(
      (value: string) => {
        const { commonTickerMatches } = findLocalMatchingTickers(value);
        return commonTickerMatches;
      },
      [findLocalMatchingTickers]
    )
  };
};
