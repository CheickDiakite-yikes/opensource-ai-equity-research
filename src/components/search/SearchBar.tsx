
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StockQuote } from "@/types";
import { SearchResults } from "./SearchResults";
import { ClearButton } from "./ClearButton";
import { searchStocks } from "@/lib/api/fmpApi";
import { toast } from "sonner";
import { useSearchHistory } from "./useSearchHistory";
import { featuredSymbols } from "@/constants/featuredSymbols";

// Stock categories for better search results 
enum StockCategory {
  EXACT_MATCH = "Exact Match",
  COMMON = "Popular Stocks",
  API = "Search Results"
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  placeholder = "Search for a stock...", 
  className
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { recentSearches, addToHistory } = useSearchHistory();
  const commandRef = useRef<HTMLDivElement>(null);
  const [, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show dropdown immediately when input is focused
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Create a stock quote object for common tickers
  const createCommonTickerQuote = (symbol: string, name: string, category: StockCategory = StockCategory.COMMON): StockQuote => {
    return {
      symbol,
      name,
      price: 0,
      changesPercentage: 0,
      change: 0,
      dayLow: 0,
      dayHigh: 0,
      yearHigh: 0,
      yearLow: 0,
      marketCap: 0,
      priceAvg50: 0,
      priceAvg200: 0,
      volume: 0,
      avgVolume: 0,
      exchange: "NYSE/NASDAQ",
      open: 0,
      previousClose: 0,
      eps: 0,
      pe: 0,
      earningsAnnouncement: null,
      sharesOutstanding: 0,
      timestamp: 0,
      isCommonTicker: true,
      category
    };
  };

  // Find matching common tickers with categorization
  const findMatchingCommonTickers = (searchQuery: string): StockQuote[] => {
    if (!searchQuery) {
      // When no query, show all featured symbols
      return featuredSymbols.map(({symbol, name}) => 
        createCommonTickerQuote(symbol, name)
      );
    }
    
    const matches: StockQuote[] = [];
    const upperQuery = searchQuery.toUpperCase();
    
    // First check for exact match - highest priority
    const featuredSymbol = featuredSymbols.find(s => s.symbol === upperQuery);
    if (featuredSymbol) {
      matches.push(createCommonTickerQuote(featuredSymbol.symbol, featuredSymbol.name, StockCategory.EXACT_MATCH));
    }
    
    // Then add other matching symbols
    featuredSymbols.forEach(({symbol, name}) => {
      if (symbol === upperQuery) return; // Skip exact matches we already added
      
      if (symbol.includes(upperQuery) || 
          name.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(createCommonTickerQuote(symbol, name));
      }
    });
    
    return matches;
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    // Always set dropdown to open when user is typing
    setIsOpen(true);
    
    // Immediately show common tickers even before API call
    const commonTickerMatches = findMatchingCommonTickers(value);
    setResults(commonTickerMatches);
    
    if (value.length < 1) {
      // Still show the dropdown even with empty query
      // but only with featured symbols
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Then fetch from API
      const searchResults = await searchStocks(value);
      
      if (searchResults && searchResults.length > 0) {
        // Add category to API results
        const categorizedApiResults = searchResults.map(result => ({
          ...result,
          category: StockCategory.API,
          isCommonTicker: false
        }));
        
        // Get symbols from API to avoid duplicates
        const apiSymbols = new Set(categorizedApiResults.map(r => r.symbol));
        
        // Filter common tickers to avoid duplicates
        const filteredCommonTickers = commonTickerMatches.filter(
          match => !apiSymbols.has(match.symbol)
        );
        
        // Combine results with exact matches first
        const exactMatches = filteredCommonTickers.filter(t => t.category === StockCategory.EXACT_MATCH);
        const regularCommonTickers = filteredCommonTickers.filter(t => t.category === StockCategory.COMMON);
        
        const combinedResults = [...exactMatches, ...categorizedApiResults, ...regularCommonTickers];
        setResults(combinedResults);
      } else if (commonTickerMatches.length === 0) {
        // If no API results and no common matches, try exact match with uppercase
        const upperValue = value.toUpperCase();
        const featuredSymbol = featuredSymbols.find(s => s.symbol === upperValue);
        
        if (featuredSymbol) {
          setResults([createCommonTickerQuote(upperValue, featuredSymbol.name, StockCategory.EXACT_MATCH)]);
        } else {
          // Show featured symbols if no matches
          setResults(findMatchingCommonTickers(""));
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      
      // Silently handle error - don't show error toast as it's disruptive during typing
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      // If there's a query and user hits enter, navigate to the first result
      if (results.length > 0) {
        handleSelectStock(results[0].symbol);
      } else {
        // Try to navigate to the exact query as a symbol
        handleSelectStock(query.toUpperCase());
      }
    }
  };

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false);
    setQuery("");
    addToHistory(symbol);
    setSearchParams({ symbol, tab: "report" });
    
    // Focus back on search input after selection for better UX
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    
    toast.success(`Loading research data for ${symbol}`, {
      duration: 2000,
    });
  };

  return (
    <div 
      className={cn(
        "relative w-full",
        className
      )}
    >
      <div className="relative flex items-center">
        <div className="absolute left-3 z-10 text-primary">
          <Search size={18} strokeWidth={2} />
        </div>
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="w-full h-11 pl-10 pr-10 rounded-lg border-input bg-background text-foreground transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
        />
        <ClearButton 
          query={query} 
          isLoading={isLoading} 
          onClear={() => {
            setQuery("");
            // Still show dropdown with featured symbols after clearing
            setResults(findMatchingCommonTickers(""));
            setIsOpen(true);
          }} 
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] w-full"
          >
            <div className="relative mt-1 w-full">
              <SearchResults
                ref={commandRef}
                query={query}
                results={results}
                isLoading={isLoading}
                recentSearches={recentSearches}
                featuredSymbols={featuredSymbols}
                onSelectStock={handleSelectStock}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
