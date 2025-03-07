
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X, TrendingUp, ChevronRight, History, Sparkles, BarChart4 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { StockQuote } from "@/types";
import { searchStocks } from "@/lib/api/fmpApi";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const navigate = useNavigate();

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

  // Filter featured symbols based on query
  const filteredFeaturedSymbols = featuredSymbols.filter(
    symbol => 
      symbol.symbol.toLowerCase().includes(query.toLowerCase()) || 
      symbol.name.toLowerCase().includes(query.toLowerCase())
  );

  // Filter recent searches based on query
  const filteredRecentSearches = recentSearches.filter(
    symbol => symbol.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false);
    navigate(`/stock/${symbol}`);
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
        <div className="absolute right-3 flex items-center space-x-1">
          {isLoading && (
            <Loader2 size={18} className="animate-spin text-primary" />
          )}
          {query.length > 0 && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <X size={16} />
            </Button>
          )}
        </div>
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
            <Command 
              ref={commandRef}
              className="rounded-xl border shadow-xl bg-popover/95 backdrop-blur-sm overflow-hidden"
            >
              <CommandList>
                <CommandInput placeholder="Search for stocks..." value={query} onValueChange={handleSearch} />
                
                {isLoading && (
                  <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center">
                    <Loader2 size={24} className="animate-spin mb-2 text-primary" />
                    <span>Searching markets...</span>
                  </div>
                )}
                
                <CommandEmpty>
                  {filteredFeaturedSymbols.length > 0 || filteredRecentSearches.length > 0 ? (
                    <div className="py-2 text-sm text-muted-foreground">
                      No API results found. Check suggested stocks below.
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 gap-2">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Search size={20} className="text-primary" />
                      </div>
                      <p className="text-center text-sm text-muted-foreground">No stocks found. Try a different search term or check featured stocks below.</p>
                    </div>
                  )}
                </CommandEmpty>
                
                {/* Recent Searches */}
                {filteredRecentSearches.length > 0 && (
                  <CommandGroup heading={
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <History size={14} />
                      <span>RECENT SEARCHES</span>
                    </div>
                  }>
                    {filteredRecentSearches.map((symbol) => (
                      <CommandItem
                        key={`recent-${symbol}`}
                        onSelect={() => handleSelectStock(symbol)}
                        className="flex items-center justify-between py-3 px-4 hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-1.5 rounded-md">
                            <History size={14} className="text-primary" />
                          </div>
                          <span className="font-medium">{symbol}</span>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {/* API Results */}
                {results.length > 0 && (
                  <CommandGroup heading={
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <BarChart4 size={14} />
                      <span>SEARCH RESULTS</span>
                    </div>
                  }>
                    {results.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        onSelect={() => handleSelectStock(stock.symbol)}
                        className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{stock.symbol}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">Stock</span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">{stock.name}</span>
                        </div>
                        {stock.price && (
                          <div className="flex flex-col items-end">
                            <span className="font-medium">${stock.price.toFixed(2)}</span>
                            <span 
                              className={cn(
                                "text-xs flex items-center",
                                stock.changesPercentage > 0 ? "text-green-600" : stock.changesPercentage < 0 ? "text-red-600" : "text-muted-foreground"
                              )}
                            >
                              {stock.changesPercentage > 0 ? "+" : ""}{stock.changesPercentage.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {/* Featured Symbols as Suggestions */}
                {filteredFeaturedSymbols.length > 0 && (
                  <CommandGroup heading={
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Sparkles size={14} />
                      <span>POPULAR STOCKS</span>
                    </div>
                  }>
                    {filteredFeaturedSymbols.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        onSelect={() => handleSelectStock(stock.symbol)}
                        className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{stock.symbol}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">Popular</span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">{stock.name}</span>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
