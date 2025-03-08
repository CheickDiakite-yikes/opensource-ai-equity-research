
import { StockQuote } from "@/types";

export interface UseSearchProps {
  featuredSymbols?: { symbol: string; name: string }[];
}

export interface SearchState {
  query: string;
  results: StockQuote[];
  isLoading: boolean;
  isOpen: boolean;
  suggestions: {symbol: string, name: string}[];
}

export interface SearchActions {
  setQuery: (query: string) => void;
  setResults: (results: StockQuote[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  setSuggestions: (suggestions: {symbol: string, name: string}[]) => void;
  handleSearch: (value: string) => void;
  findMatchingCommonTickers: (value: string) => StockQuote[];
}
