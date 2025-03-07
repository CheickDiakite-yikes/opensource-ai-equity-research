
import { useCallback } from "react";
import { prefetchSymbolData } from "@/services/api/enhancedApiService";

/**
 * Hook to manage prefetching symbol data
 */
export const usePrefetchSymbolData = () => {
  /**
   * Prefetch data for a single symbol
   */
  const prefetchSymbol = useCallback(async (symbol: string) => {
    if (!symbol) return false;
    return await prefetchSymbolData(symbol);
  }, []);

  /**
   * Prefetch data for multiple symbols (e.g., watchlist)
   */
  const prefetchSymbols = useCallback(async (symbols: string[]) => {
    const validSymbols = symbols.filter(s => !!s);
    
    if (validSymbols.length === 0) return false;
    
    const results = await Promise.allSettled(
      validSymbols.map(symbol => prefetchSymbolData(symbol))
    );
    
    // Count successful prefetches
    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value === true
    ).length;
    
    return successCount > 0;
  }, []);

  return {
    prefetchSymbol,
    prefetchSymbols
  };
};
