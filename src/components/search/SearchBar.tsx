import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResults } from "./SearchResults";
import { ClearButton } from "./ClearButton";
import { featuredSymbols as defaultFeaturedSymbols } from "@/constants/featuredSymbols";
import { commonTickers } from "@/constants/commonTickers";
import { useSearch } from "./hooks/useSearch";
import { useSearchInteractions } from "./hooks/useSearchInteractions";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  featuredSymbols?: { symbol: string; name: string }[];
  autoFocus?: boolean;
  onSelectCallback?: (symbol: string) => void;
}

const SearchBar = ({ 
  placeholder = "Search for a stock...", 
  className,
  featuredSymbols = defaultFeaturedSymbols,
  autoFocus = false,
  onSelectCallback
}: SearchBarProps) => {
  const navigate = useNavigate();
  
  // Combine featured symbols with common tickers
  const allSymbols = [...featuredSymbols, ...commonTickers.filter(
    ticker => !featuredSymbols.some(fs => fs.symbol === ticker.symbol)
  )];
  
  const { 
    query, 
    setQuery, 
    results, 
    setResults,
    isLoading, 
    isOpen, 
    setIsOpen,
    handleSearch,
    findMatchingCommonTickers
  } = useSearch({ featuredSymbols: allSymbols });
  
  const {
    handleFocus,
    handleSelectStock: baseHandleSelectStock,
    commandRef,
    searchInputRef,
    recentSearches
  } = useSearchInteractions(onSelectCallback);
  
  // Custom handler that ensures proper navigation
  const handleSelectStock = (symbol: string) => {
    if (onSelectCallback) {
      // If a callback is provided, use it (for custom handling)
      onSelectCallback(symbol);
    } else {
      // Otherwise use default navigation behavior
      const params = new URLSearchParams();
      params.set('symbol', symbol);
      params.set('tab', 'overview');
      navigate(`/?${params.toString()}`);
    }
    
    // Close the dropdown
    setIsOpen(false);
  };
  
  useEffect(() => {
    // Auto focus the search input if requested
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus, searchInputRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      // If there's a query and user hits enter, navigate to the first result
      if (results.length > 0) {
        handleSelectStock(results[0].symbol);
      } else {
        // Try to navigate to the exact query as a symbol
        handleSelectStock(query.toUpperCase());
      }
      e.preventDefault();
    }
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
