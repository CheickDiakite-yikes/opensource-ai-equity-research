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

// Additional popular stock tickers that might not be returned by the API
const commonTickers: Record<string, string> = {
  'DIS': 'Walt Disney Company',
  'NFLX': 'Netflix Inc.',
  'GOOGL': 'Alphabet Inc. Class A',
  'GOOG': 'Alphabet Inc. Class C',
  'FB': 'Meta Platforms Inc.',
  'META': 'Meta Platforms Inc.',
  'AMZN': 'Amazon.com Inc.',
  'MSFT': 'Microsoft Corporation',
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'BAC': 'Bank of America Corporation',
  'WMT': 'Walmart Inc.',
  'JNJ': 'Johnson & Johnson',
  'PG': 'Procter & Gamble Company',
  'V': 'Visa Inc.',
  'MA': 'Mastercard Incorporated',
  'PFE': 'Pfizer Inc.',
  'XOM': 'Exxon Mobil Corporation',
  'CVX': 'Chevron Corporation',
  'KO': 'Coca-Cola Company',
  'PEP': 'PepsiCo Inc.',
  'INTC': 'Intel Corporation',
  'CSCO': 'Cisco Systems Inc.',
  'VZ': 'Verizon Communications Inc.',
  'T': 'AT&T Inc.',
};

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  featuredSymbols?: {symbol: string, name: string}[];
}

const SearchBar = ({ 
  placeholder = "Search for a stock...", 
  className,
  featuredSymbols = [] 
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const commandRef = useRef<HTMLDivElement>(null);
  const [, setSearchParams] = useSearchParams();

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 3));
    }
  }, []);

  // Handle clicks outside to close dropdown
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

  // Check if the query matches any common tickers
  const findMatchingCommonTickers = (searchQuery: string): StockQuote[] => {
    if (!searchQuery) return [];
    
    const matches: StockQuote[] = [];
    const upperQuery = searchQuery.toUpperCase();
    
    // First check for exact matches
    Object.entries(commonTickers).forEach(([symbol, name]) => {
      if (symbol === upperQuery) {
        matches.push({
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
          sharesOutstanding: 0,
          timestamp: 0,
          isCommonTicker: true,
        });
      }
    });
    
    // Then check for starting with query
    if (matches.length === 0) {
      Object.entries(commonTickers).forEach(([symbol, name]) => {
        if (symbol.startsWith(upperQuery) || 
            name.toUpperCase().includes(upperQuery)) {
          matches.push({
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
            sharesOutstanding: 0,
            timestamp: 0,
            isCommonTicker: true,
          });
        }
      });
    }
    
    return matches;
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (value.length < 1) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setIsOpen(true);
    
    try {
      // Get API results
      const searchResults = await searchStocks(value);
      
      // Get common ticker matches
      const commonTickerMatches = findMatchingCommonTickers(value);
      
      // Filter out duplicates (prefer API results over common tickers)
      const apiSymbols = new Set((searchResults || []).map(r => r.symbol));
      const filteredCommonTickers = commonTickerMatches.filter(
        match => !apiSymbols.has(match.symbol)
      );
      
      // Combine results, putting API results first
      const combinedResults = [...(searchResults || []), ...filteredCommonTickers];
      
      setResults(combinedResults);
    } catch (error) {
      console.error("Search error:", error);
      
      // If API fails, still show common ticker matches
      const commonTickerMatches = findMatchingCommonTickers(value);
      setResults(commonTickerMatches);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false);
    
    // Save to recent searches
    const updatedSearches = [
      symbol,
      ...recentSearches.filter(s => s !== symbol)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Navigate to the appropriate URL with query parameters
    setSearchParams({ symbol, tab: "report" });
  };

  return (
    <div 
      className={cn(
        "relative w-full",
        className
      )}
    >
      <div className="relative flex items-center">
        <div className="absolute left-3 z-10 text-primary/70">
          <Search size={16} strokeWidth={2.5} />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full h-10 pl-9 pr-10 rounded-lg border-input/50 bg-background text-foreground transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm"
        />
        <ClearButton 
          query={query} 
          isLoading={isLoading} 
          onClear={() => {
            setQuery("");
            setResults([]);
          }} 
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 w-full z-50"
          >
            <SearchResults
              ref={commandRef}
              query={query}
              results={results}
              isLoading={isLoading}
              recentSearches={recentSearches}
              featuredSymbols={featuredSymbols}
              onSelectStock={handleSelectStock}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
