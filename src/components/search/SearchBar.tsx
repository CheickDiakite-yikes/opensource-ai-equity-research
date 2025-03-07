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

const commonTickers: Record<string, string> = {
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
  'DIS': 'Walt Disney Company',
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

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 3));
    }
  }, []);

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

  const createCommonTickerQuote = (symbol: string, name: string): StockQuote => {
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
    };
  };

  const findMatchingCommonTickers = (searchQuery: string): StockQuote[] => {
    if (!searchQuery) return [];
    
    const matches: StockQuote[] = [];
    const upperQuery = searchQuery.toUpperCase();
    
    if (commonTickers[upperQuery]) {
      matches.push(createCommonTickerQuote(upperQuery, commonTickers[upperQuery]));
      return matches;
    }
    
    Object.entries(commonTickers).forEach(([symbol, name]) => {
      if (symbol.includes(upperQuery) || 
          name.toUpperCase().includes(upperQuery)) {
        matches.push(createCommonTickerQuote(symbol, name));
      }
    });
    
    return matches;
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (value.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    setIsLoading(true);
    setIsOpen(true);
    
    try {
      const commonTickerMatches = findMatchingCommonTickers(value);
      
      if (commonTickerMatches.length > 0) {
        setResults(commonTickerMatches);
      }
      
      const searchResults = await searchStocks(value);
      
      if (searchResults && searchResults.length > 0) {
        const apiSymbols = new Set(searchResults.map(r => r.symbol));
        const filteredCommonTickers = commonTickerMatches.filter(
          match => !apiSymbols.has(match.symbol)
        );
        
        const combinedResults = [...searchResults, ...filteredCommonTickers];
        setResults(combinedResults);
      } else if (commonTickerMatches.length === 0) {
        const upperValue = value.toUpperCase();
        if (commonTickers[upperValue]) {
          setResults([createCommonTickerQuote(upperValue, commonTickers[upperValue])]);
        } else {
          setResults([]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      
      const commonTickerMatches = findMatchingCommonTickers(value);
      setResults(commonTickerMatches.length > 0 ? commonTickerMatches : []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false);
    
    const updatedSearches = [
      symbol,
      ...recentSearches.filter(s => s !== symbol)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
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
          onFocus={() => {
            if (query.length > 0) setIsOpen(true);
          }}
          className="w-full h-10 pl-9 pr-10 rounded-lg border-input/50 bg-background text-foreground transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm"
        />
        <ClearButton 
          query={query} 
          isLoading={isLoading} 
          onClear={() => {
            setQuery("");
            setResults([]);
            setIsOpen(false);
          }} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-[60] w-full">
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
        </div>
      )}
    </div>
  );
};

export default SearchBar;
