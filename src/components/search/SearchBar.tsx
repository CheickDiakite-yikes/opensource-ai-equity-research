
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StockQuote } from "@/types";
import { SearchResults } from "./SearchResults";
import { searchStocks } from "@/lib/api/fmpApi";

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

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (value.length < 1) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setIsOpen(true);
    
    try {
      const searchResults = await searchStocks(value);
      setResults(searchResults || []);
    } catch (error) {
      console.error("Search error:", error);
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
        "relative w-full max-w-3xl mx-auto",
        className
      )}
    >
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 text-primary/70">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full h-12 pl-12 pr-16 rounded-full shadow-lg border-input/50 bg-background text-foreground transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-base"
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
            className="absolute top-full mt-1 w-full z-10"
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
