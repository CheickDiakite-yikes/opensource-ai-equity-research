import { useCallback, useEffect, useState } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../../types";
import { searchStocks } from "@/lib/api/fmpApi";
import { createCommonTickerQuote, findMatchingCommonTickers } from "../../utils/searchUtils";
import { commonTickers } from "@/constants/commonTickers";
import { UseSearchProps } from "./types";

interface SearchResultHandlers {
  handleSearch: (value: string) => Promise<void>;
  findMatchingCommonTickers: (value: string) => StockQuote[];
}

const useApiSearch = (
  query: string,
  featuredSymbols: { symbol: string; name: string }[],
  setResults: (results: StockQuote[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  isMounted: React.MutableRefObject<boolean>
) => {
  return useCallback(async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    try {
      const searchResults = await searchStocks(query);

      if (!isMounted.current) return;

      if (searchResults && searchResults.length > 0) {
        return searchResults;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Search error:", error);
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [query, setIsLoading, isMounted]);
};

const useCommonTickerSearch = (
  query: string,
  featuredSymbols: { symbol: string; name: string }[]
) => {
  return useCallback(() => {
    const upperValue = query.toUpperCase();
    const exactMatch = commonTickers.find(ticker => ticker.symbol === upperValue);
    const commonTickerMatches = findMatchingCommonTickers(query, featuredSymbols);

    return { exactMatch, commonTickerMatches };
  }, [query, featuredSymbols]);
};

const useResultProcessors = (
  featuredSymbols: { symbol: string; name: string }[],
  setResults: (results: StockQuote[]) => void,
  isMounted: React.MutableRefObject<boolean>
) => {
  const processApiResults = useCallback((
    apiResults: StockQuote[],
    commonMatches: StockQuote[],
    exactMatch: { symbol: string; name: string } | undefined
  ) => {
    if (!isMounted.current) return [];

    const categorizedApiResults = apiResults.map(result => ({
      ...result,
      category: StockCategory.API,
      isCommonTicker: false
    }));

    const apiSymbols = new Set(categorizedApiResults.map(r => r.symbol));

    const filteredCommonTickers = commonMatches.filter(
      match => !apiSymbols.has(match.symbol)
    );

    const exactMatches = filteredCommonTickers.filter(t => t.category === StockCategory.EXACT_MATCH);
    const regularCommonTickers = filteredCommonTickers.filter(t => t.category === StockCategory.COMMON);

    return [...exactMatches, ...categorizedApiResults, ...regularCommonTickers];
  }, [isMounted]);

  const handleNoApiResults = useCallback((
    commonMatches: StockQuote[],
    exactMatch: { symbol: string; name: string } | undefined,
    upperValue: string
  ) => {
    if (!isMounted.current) return [];

    if (exactMatch) {
      return commonMatches;
    }

    if (commonMatches.length === 0) {
      const featuredSymbol = featuredSymbols.find(s => s.symbol === upperValue);

      if (featuredSymbol) {
        return [createCommonTickerQuote(upperValue, featuredSymbol.name, StockCategory.EXACT_MATCH)];
      }

      return findMatchingCommonTickers("", featuredSymbols);
    }

    return commonMatches;
  }, [featuredSymbols, isMounted]);

  const createExactMatchQuote = useCallback((exactCommonMatch: { symbol: string; name: string } | undefined) => {
    if (exactCommonMatch && isMounted.current) {
      return createCommonTickerQuote(
        exactCommonMatch.symbol,
        exactCommonMatch.name,
        StockCategory.EXACT_MATCH
      );
    }
    return undefined;
  }, [isMounted]);

  return { processApiResults, handleNoApiResults, createExactMatchQuote };
};

export const useSearchResults = (
  { featuredSymbols = commonTickers }: UseSearchProps,
  query: string,
  isOpen: boolean,
  setResults: (results: StockQuote[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  isMounted: React.MutableRefObject<boolean>
): SearchResultHandlers => {
  useEffect(() => {
    if (isOpen && query.length === 0 && isMounted.current) {
      const featuredResults = findMatchingCommonTickers("", featuredSymbols);
      setResults(featuredResults);
    }
  }, [isOpen, featuredSymbols, query, setResults]);

  const { processApiResults, handleNoApiResults, createExactMatchQuote } = useResultProcessors(
    featuredSymbols,
    setResults,
    isMounted
  );

  const { exactMatch: exactCommonMatch, commonTickerMatches } = useCommonTickerSearch(query, featuredSymbols)();

  const apiSearch = useApiSearch(query, featuredSymbols, setResults, setIsLoading, isMounted);

  const handleSearch = useCallback(async (value: string) => {
    if (!isMounted.current) return;

    const upperValue = value.toUpperCase();

    let exactMatchQuote: StockQuote | undefined = createExactMatchQuote(exactCommonMatch);

    if (isMounted.current) {
      if (exactCommonMatch) {
        setResults([
          ...(exactMatchQuote ? [exactMatchQuote] : []),
          ...commonTickerMatches.filter(r => r.category !== StockCategory.EXACT_MATCH)
        ]);
      } else {
        setResults(commonTickerMatches);
      }
    }

    if (value.length < 1) {
      return;
    }

    const searchResults = await apiSearch();

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
  }, [featuredSymbols, processApiResults, handleNoApiResults, apiSearch, createExactMatchQuote, exactCommonMatch, commonTickerMatches, setResults, isMounted]);

  const findLocalMatchingTickers = useCallback(
    (value: string) => findMatchingCommonTickers(value, featuredSymbols),
    [featuredSymbols]
  );

  return {
    handleSearch,
    findMatchingCommonTickers: findLocalMatchingTickers
  };
};
