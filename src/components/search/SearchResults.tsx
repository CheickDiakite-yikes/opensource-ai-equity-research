
import { forwardRef } from "react";
import { StockQuote } from "@/types";
import { 
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandSeparator
} from "@/components/ui/command";
import { History, BarChart4, Sparkles, TrendingUp, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SearchResultSkeleton from "./SearchResultSkeleton";
import EmptySearchState from "./EmptySearchState";
import SearchResultsSection from "./SearchResultsSection";

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
  
  const hasNoResults = !isLoading && 
                        results.length === 0 && 
                        filteredFeaturedSymbols.length === 0 && 
                        filteredRecentSearches.length === 0;
  
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
        
        {/* Empty State */}
        {hasNoResults && (
          <CommandEmpty>
            <EmptySearchState onSelectStock={onSelectStock} />
          </CommandEmpty>
        )}
        
        {/* Exact Matches Section */}
        <SearchResultsSection
          title="EXACT MATCH"
          icon={TrendingUp}
          items={exactMatches}
          itemType="stock"
          onSelectStock={onSelectStock}
          highlightMatch={highlightMatch}
          query={query}
        />
        
        {/* Recent Searches Section */}
        <SearchResultsSection
          title="RECENT SEARCHES"
          icon={History}
          items={filteredRecentSearches}
          itemType="recent"
          onSelectStock={onSelectStock}
          highlightMatch={highlightMatch}
          query={query}
        />
        
        {/* API Results Section */}
        <SearchResultsSection
          title="SEARCH RESULTS"
          icon={BarChart4}
          items={apiResults}
          itemType="stock"
          onSelectStock={onSelectStock}
          highlightMatch={highlightMatch}
          query={query}
        />
        
        {/* Common Results Section (Popular) */}
        <SearchResultsSection
          title="POPULAR STOCKS"
          icon={Sparkles}
          items={commonResults}
          itemType="stock"
          onSelectStock={onSelectStock}
          showSeparator={exactMatches.length > 0 || apiResults.length > 0 || filteredRecentSearches.length > 0}
          highlightMatch={highlightMatch}
          query={query}
        />
        
        {/* Featured Symbols Section */}
        {!isLoading && shouldShowFeatured && filteredFeaturedSymbols.length > 0 && (
          <SearchResultsSection
            title="SUGGESTED STOCKS"
            icon={Info}
            items={filteredFeaturedSymbols.slice(0, 5)}
            itemType="featured"
            onSelectStock={onSelectStock}
            showSeparator={results.length > 0 || filteredRecentSearches.length > 0}
            highlightMatch={highlightMatch}
            query={query}
          />
        )}
      </CommandList>
    </Command>
  );
});

SearchResults.displayName = "SearchResults";
