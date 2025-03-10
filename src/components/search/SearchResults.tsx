
import { forwardRef } from "react";
import { StockQuote } from "@/types";
import { 
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup
} from "@/components/ui/command";
import { Loader2, History, BarChart4, Sparkles, TrendingUp, Info } from "lucide-react";
import { SearchResultItem } from "./SearchResultItem";
import { FeaturedSymbolItem } from "./FeaturedSymbolItem";
import { RecentSearchItem } from "./RecentSearchItem";
import { SearchResultSkeleton } from "./SearchResultSkeleton";
import { SearchResultsEmpty } from "./SearchResultsEmpty";
import { SearchResultsSection } from "./SearchResultsSection";

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

  // Check if there are no results to show
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
            <SearchResultSkeleton />
          </CommandGroup>
        )}
        
        {/* Empty State */}
        {hasNoResults && (
          <CommandEmpty>
            <SearchResultsEmpty onSelectStock={onSelectStock} />
          </CommandEmpty>
        )}
        
        {/* Recent Searches Section - Show at the top when there's no query */}
        {!isLoading && !query && filteredRecentSearches.length > 0 && (
          <SearchResultsSection 
            icon={History} 
            title="RECENT SEARCHES"
          >
            {filteredRecentSearches.map((symbol) => (
              <RecentSearchItem 
                key={`recent-${symbol}`}
                symbol={symbol}
                onSelect={() => onSelectStock(symbol)}
                highlightMatch={highlightMatch}
                query={query}
              />
            ))}
          </SearchResultsSection>
        )}
        
        {/* Exact Matches Section */}
        {!isLoading && exactMatches.length > 0 && (
          <SearchResultsSection 
            icon={TrendingUp} 
            title="EXACT MATCH"
          >
            {exactMatches.map((stock) => (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                onSelect={() => onSelectStock(stock.symbol)}
                highlightMatch={highlightMatch}
                query={query}
              />
            ))}
          </SearchResultsSection>
        )}
        
        {/* API Results Section */}
        {!isLoading && apiResults.length > 0 && (
          <SearchResultsSection 
            icon={BarChart4} 
            title="SEARCH RESULTS"
          >
            {apiResults.map((stock) => (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                onSelect={() => onSelectStock(stock.symbol)}
                highlightMatch={highlightMatch}
                query={query}
              />
            ))}
          </SearchResultsSection>
        )}
        
        {/* Featured Symbols Section */}
        {!isLoading && !query && filteredFeaturedSymbols.length > 0 && (
          <SearchResultsSection 
            icon={Info} 
            title="SUGGESTED STOCKS"
            showSeparator={true}
          >
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
          </SearchResultsSection>
        )}
      </CommandList>
    </Command>
  );
});

SearchResults.displayName = "SearchResults";
