
import { Search, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResults } from "./SearchResults";
import { ClearButton } from "./ClearButton";
import { featuredSymbols as defaultFeaturedSymbols } from "@/constants/featuredSymbols";
import { commonTickers } from "@/constants/commonTickers";
import { useSearch } from "./hooks/useSearch";
import { useSearchInteractions } from "./hooks/useSearchInteractions";
import { useEffect, useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  const [activeIndex, setActiveIndex] = useState(-1);
  
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

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);
  
  useEffect(() => {
    // Auto focus the search input if requested
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus, searchInputRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const allResults = [...results];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
      setIsOpen(true);
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
      setIsOpen(true);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allResults.length) {
        // Select the currently active item
        handleSelectStock(allResults[activeIndex].symbol);
      } else if (query.trim() !== '') {
        // If there's a query but no active selection, use the first result
        if (allResults.length > 0) {
          handleSelectStock(allResults[0].symbol);
        } else {
          // Try to navigate to the exact query as a symbol
          handleSelectStock(query.toUpperCase());
        }
      }
    } 
    else if (e.key === 'Escape') {
      setIsOpen(false);
    } 
    else if (e.key === 'Tab') {
      // On Tab, complete with suggestion if available
      if (suggestions.length > 0) {
        e.preventDefault();
        setQuery(suggestions[0].symbol);
        handleSearch(suggestions[0].symbol);
      }
    }
  };

  // Get auto-complete suggestion
  const currentSuggestion = suggestions.length > 0 ? suggestions[0].symbol : '';
  const displaySuggestion = currentSuggestion && query && 
    currentSuggestion.toLowerCase().startsWith(query.toLowerCase()) ? 
    currentSuggestion.substring(query.length) : '';

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
        
        <div className="relative w-full">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="w-full h-11 pl-10 pr-10 rounded-lg border-input bg-background text-foreground transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 animate-cursor"
            autoComplete="off"
          />
          
          {/* Auto-complete suggestion */}
          {displaySuggestion && isOpen && (
            <div className="absolute left-[calc(10px+0.55ch*var(--length))] top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                 style={{ "--length": query.length } as React.CSSProperties}>
              {displaySuggestion}
            </div>
          )}
        </div>
        
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
      
      {/* Keyboard navigation hints */}
      {isOpen && results.length > 0 && (
        <div className="absolute right-3 top-13 z-[101] flex gap-1 mt-2">
          <Badge variant="outline" className="flex items-center gap-1 h-6 bg-background/80 backdrop-blur-sm">
            <ArrowUp size={12} /> <ArrowDown size={12} /> to navigate
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 h-6 bg-background/80 backdrop-blur-sm">
            <ArrowRight size={12} /> to select
          </Badge>
        </div>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            <div className="absolute top-[calc(100%+8px)] inset-x-0 pointer-events-auto" style={{width: searchInputRef.current?.offsetWidth}}>
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
