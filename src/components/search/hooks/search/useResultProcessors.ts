
import { useCallback } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../../types";
import { createCommonTickerQuote } from "../../utils/searchUtils";

export const useResultProcessors = (
  featuredSymbols: { symbol: string; name: string }[],
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

      // Return empty results for no matches
      return [];
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
