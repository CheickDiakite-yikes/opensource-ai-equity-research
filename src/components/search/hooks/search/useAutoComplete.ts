
import { useEffect, useCallback } from "react";
import { commonTickers } from "@/constants/commonTickers";

export const useAutoComplete = (
  query: string, 
  setSuggestions: (suggestions: {symbol: string, name: string}[]) => void,
  isMounted: React.MutableRefObject<boolean>
) => {
  // Generate suggestions for autocomplete
  useEffect(() => {
    if (!isMounted.current) return;
    
    if (query.length > 0) {
      // Find potential matches for autocomplete, looking only at the beginning of symbols
      const autocompleteSuggestions = commonTickers
        .filter(ticker => 
          ticker.symbol.toLowerCase().startsWith(query.toLowerCase()) && 
          ticker.symbol.toLowerCase() !== query.toLowerCase()
        )
        .slice(0, 5);
      
      setSuggestions(autocompleteSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, setSuggestions]);
};
