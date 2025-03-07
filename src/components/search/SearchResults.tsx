
import { forwardRef } from "react";
import { StockQuote } from "@/types";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Loader2, History, BarChart4, Sparkles, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchResultItem } from "./SearchResultItem";
import { FeaturedSymbolItem } from "./FeaturedSymbolItem";
import { RecentSearchItem } from "./RecentSearchItem";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  return (
    <Command 
      ref={ref}
      className="rounded-xl border shadow-xl bg-background text-foreground z-50 overflow-hidden w-full absolute top-full left-0"
    >
      <CommandList>
        <CommandInput placeholder="Search for stocks..." value={query} onValueChange={(value) => {}} />
        
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
        
        {/* Empty State */}
        {!isLoading && (
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
                <p className="text-center text-sm text-muted-foreground">
                  No stocks found. Try a different search term or check featured stocks below.
                </p>
              </div>
            )}
          </CommandEmpty>
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
              />
            ))}
          </CommandGroup>
        )}
        
        {/* API Results Section */}
        {!isLoading && results.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <BarChart4 size={14} />
              <span>SEARCH RESULTS</span>
            </div>
          }>
            {results.map((stock) => (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                onSelect={() => onSelectStock(stock.symbol)}
              />
            ))}
          </CommandGroup>
        )}
        
        {/* Featured Symbols Section */}
        {!isLoading && filteredFeaturedSymbols.length > 0 && (
          <CommandGroup heading={
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Sparkles size={14} />
              <span>POPULAR STOCKS</span>
            </div>
          }>
            {filteredFeaturedSymbols.map((stock) => (
              <FeaturedSymbolItem
                key={stock.symbol}
                symbol={stock.symbol}
                name={stock.name}
                onSelect={() => onSelectStock(stock.symbol)}
              />
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
});

SearchResults.displayName = "SearchResults";
