
import { useCallback } from "react";
import { StockQuote } from "@/types";
import { searchStocks } from "@/lib/api/fmpApi";

export const useApiSearch = (
  query: string,
  featuredSymbols: { symbol: string; name: string }[],
  setIsLoading: (isLoading: boolean) => void,
  isMounted: React.MutableRefObject<boolean>
) => {
  return useCallback(async () => {
    if (!isMounted.current) return null;

    setIsLoading(true);
    try {
      const searchResults = await searchStocks(query);

      if (!isMounted.current) return null;

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
