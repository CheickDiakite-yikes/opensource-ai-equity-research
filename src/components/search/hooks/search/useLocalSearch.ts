
import { useCallback } from "react";
import { StockQuote } from "@/types";
import { StockCategory } from "../../types";
import { commonTickers } from "@/constants/commonTickers";
import { createCommonTickerQuote, findMatchingCommonTickers } from "../../utils/searchUtils";

export const useLocalSearch = (
  featuredSymbols: { symbol: string; name: string }[] = []
) => {
  return useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    const exactMatch = commonTickers.find(ticker => ticker.symbol === upperValue);
    const commonTickerMatches = findMatchingCommonTickers(value, featuredSymbols);

    return {
      exactMatch,
      commonTickerMatches
    };
  }, [featuredSymbols]);
};
