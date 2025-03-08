
import { motion, AnimatePresence } from "framer-motion";
import { SearchResults } from "./SearchResults";
import { featuredSymbols as defaultFeaturedSymbols } from "@/constants/featuredSymbols";
import { commonTickers } from "@/constants/commonTickers";
import { useSearch } from "./hooks/useSearch";
import { useSearchInteractions } from "./hooks/useSearchInteractions";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import SearchInputContainer from "./SearchInputContainer";
import KeyboardNavigationHints from "./KeyboardNavigationHints";

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
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  
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
    findMatchingCommonTickers,
    suggestions
  } = useSearch({ featuredSymbols: allSymbols });
  
  const {
    handleFocus,
    handleSelectStock,
    commandRef,
    searchInputRef,
    recentSearches
  } = useSearchInteractions(onSelectCallback);

  const { activeIndex, handleKeyDown } = useKeyboardNavigation({
    results,
    query,
    suggestions,
    isOpen,
    setIsOpen,
    handleSearch,
    handleSelectStock
  });
  
  useEffect(() => {
    // Auto focus the search input if requested
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus, searchInputRef]);

  // Get auto-complete suggestion
  const currentSuggestion = suggestions.length > 0 ? suggestions[0].symbol : '';

  return (
    <div 
      className={cn(
        "relative w-full",
        className
      )}
      ref={dropdownContainerRef}
    >
      <SearchInputContainer 
        query={query}
        suggestion={currentSuggestion}
        isOpen={isOpen}
        isLoading={isLoading}
        placeholder={placeholder}
        searchInputRef={searchInputRef}
        onClear={() => {
          setQuery("");
          // Still show dropdown with featured symbols after clearing
          setResults(findMatchingCommonTickers(""));
          setIsOpen(true);
        }}
        onChange={handleSearch}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      
      <KeyboardNavigationHints visible={isOpen && results.length > 0} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full"
          >
            <div className="relative mt-1 shadow-lg rounded-xl overflow-hidden">
              <SearchResults
                ref={commandRef}
                query={query}
                results={results}
                isLoading={isLoading}
                recentSearches={recentSearches}
                featuredSymbols={featuredSymbols}
                onSelectStock={handleSelectStock}
                activeIndex={activeIndex}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
