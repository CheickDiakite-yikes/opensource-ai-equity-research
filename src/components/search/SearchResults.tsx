
import { forwardRef } from "react";
import { StockQuote } from "@/types";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Loader2, History, BarChart4, Sparkles, Search, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchResultItem } from "./SearchResultItem";
import { FeaturedSymbolItem } from "./FeaturedSymbolItem";
import { RecentSearchItem } from "./RecentSearchItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Create a separate SearchResultSkeleton component for better organization
const SearchResultSkeleton = () => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
};

interface SearchResultsProps {
  query: string;
  results: StockQuote[];
  isLoading: boolean;
  recentSearches: string[];
  featuredSymbols: {symbol: string, name: string}[];
  onSelectStock: (symbol: string) => void;
}

export const SearchResults = forwardRef<HTMLDivElement, SearchResultsProps>(({
  query,
  results,
  isLoading,
  recentSearches,
  featuredSymbols,
  onSelectStock
}, ref) => {
  const exactMatches = results.filter(stock => stock.category === "Exact Match");
  const apiResults = results.filter(stock => stock.category === "Search Results");
  const commonResults = results.filter(stock => stock.category === "Popular Stocks");
  
  // Filter featured symbols based on query
  const filteredFeaturedSymbols = featuredSymbols.filter(
    symbol => 
      !query || 
      symbol.symbol.toLowerCase().includes(query.toLowerCase()) || 
      symbol.name.toLowerCase().includes(query.toLowerCase())
  );

  // Filter recent searches based on query
  const filteredRecentSearches = recentSearches.filter(
    symbol => !query || symbol.toLowerCase().includes(query.toLowerCase())
  );
  
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    
    try {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<span class="bg-primary/20 text-primary rounded-sm px-0.5">$1</span>');
    } catch {
      return text;
    }
  };

  // Determine if we should show the featured symbols section
  const shouldShowFeatured = (
    !query || // Always show if no query
    filteredFeaturedSymbols.length > 0 // Show if there are filtered results
  ) && (
    apiResults.length < 5 // Only show if API results are limited
  );
  
  return (
    <Command 
      ref={ref}
      className="rounded-xl border shadow-xl bg-background text-foreground overflow-hidden w-full absolute top-full left-0 max-h-[80vh]"
    >
      <CommandList className="max-h-[50vh]">
        <CommandInput placeholder="Search for stocks..." value={query} onValueChange={() => {}} />
        
        {/* Loading State with Skeleton */}
        {isLoading && (
          <CommandGroup>
            <div className="py-2">
              <div className="flex items-center justify-between mb-2 px-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <SearchResultSkeleton />
            </div>
          </CommandGroup>
        )}
        
        {/* Empty State - only show when there are no results and no recent searches */}
        {!isLoading && results.length === 0 && filteredFeaturedSymbols.length === 0 && filteredRecentSearches.length === 0 && (
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 gap-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Search size={20} className="text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                No stocks found. Try a different search term.
              </p>
              <div className="flex flex-col gap-1 items-center mt-2 max-w-md text-center">
                <p className="text-xs text-muted-foreground">Try searching for:</p>
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'].map(symbol => (
                    <Button 
                      key={symbol} 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => onSelectStock(symbol)}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CommandEmpty>
        )}
        
        {/* Exact Matches Section */}
        {!isLoading && exactMatches.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <TrendingUp size={14} />
              <span>EXACT MATCH</span>
            </div>
          }>
            {exactMatches.map((stock) => (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                onSelect={() => onSelectStock(stock.symbol)}
                highlightMatch={highlightMatch}
                query={query}
              />
            ))}
          </CommandGroup>
        )}
        
        {/* Recent Searches Section */}
        {!isLoading && filteredRecentSearches.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <History size={14} />
              <span>RECENT SEARCHES</span>
            </div>
          }>
            {filteredRecentSearches.map((symbol) => (
              <RecentSearchItem 
                key={`recent-${symbol}`}
                symbol={symbol}
                onSelect={() => onSelectStock(symbol)}
                highlightMatch={highlightMatch}
                query={query}
              />
            ))}
          </CommandGroup>
        )}
        
        {/* API Results Section */}
        {!isLoading && apiResults.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <BarChart4 size={14} />
              <span>SEARCH RESULTS</span>
            </div>
          }>
            {apiResults.map((stock) => (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                onSelect={() => onSelectStock(stock.symbol)}
                highlightMatch={highlightMatch}
                query={query}
              />
            ))}
          </CommandGroup>
        )}
        
        {/* Common Results Section (Popular) */}
        {!isLoading && commonResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Sparkles size={14} />
                <span>POPULAR STOCKS</span>
              </div>
            }>
              {commonResults.map((stock) => (
                <SearchResultItem
                  key={stock.symbol}
                  stock={stock}
                  onSelect={() => onSelectStock(stock.symbol)}
                  highlightMatch={highlightMatch}
                  query={query}
                />
              ))}
            </CommandGroup>
          </>
        )}
        
        {/* Featured Symbols Section */}
        {!isLoading && shouldShowFeatured && filteredFeaturedSymbols.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Info size={14} />
                <span>SUGGESTED STOCKS</span>
              </div>
            }>
              {filteredFeaturedSymbols.slice(0, 5).map((stock) => (
                <FeaturedSymbolItem
                  key={stock.symbol}
                  symbol={stock.symbol}
                  name={stock.name}
                  onSelect={() => onSelectStock(stock.symbol)}
                  highlightMatch={highlightMatch}
                  query={query}
                />
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
});

SearchResults.displayName = "SearchResults";
