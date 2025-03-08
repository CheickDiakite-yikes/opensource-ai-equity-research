
import { CommandGroup, CommandSeparator } from "@/components/ui/command";
import { LucideIcon } from "lucide-react";
import SearchSectionHeading from "./SearchSectionHeading";
import { StockQuote } from "@/types";
import { SearchResultItem } from "./SearchResultItem";
import { FeaturedSymbolItem } from "./FeaturedSymbolItem";
import { RecentSearchItem } from "./RecentSearchItem";

interface SearchResultsSectionProps {
  title: string;
  icon: LucideIcon;
  items: Array<StockQuote | string | { symbol: string; name: string }>;
  itemType: "stock" | "recent" | "featured";
  onSelectStock: (symbol: string) => void;
  showSeparator?: boolean;
  highlightMatch?: (text: string, query: string) => string;
  query?: string;
  activeIndex?: number;
  activeIndexOffset?: number;
}

const SearchResultsSection = ({
  title,
  icon,
  items,
  itemType,
  onSelectStock,
  showSeparator = false,
  highlightMatch,
  query = "",
  activeIndex = -1,
  activeIndexOffset = 0
}: SearchResultsSectionProps) => {
  if (items.length === 0) return null;

  return (
    <>
      {showSeparator && <CommandSeparator />}
      <CommandGroup heading={<SearchSectionHeading icon={icon} title={title} />}>
        {items.map((item, idx) => {
          const isActive = activeIndex === idx + activeIndexOffset;
          
          if (itemType === "stock") {
            const stock = item as StockQuote;
            return (
              <SearchResultItem
                key={stock.symbol}
                stock={stock}
                onSelect={() => onSelectStock(stock.symbol)}
                highlightMatch={highlightMatch}
                query={query}
                isActive={isActive}
              />
            );
          } else if (itemType === "recent") {
            const symbol = item as string;
            return (
              <RecentSearchItem
                key={`recent-${symbol}`}
                symbol={symbol}
                onSelect={() => onSelectStock(symbol)}
                highlightMatch={highlightMatch}
                query={query}
                isActive={isActive}
              />
            );
          } else {
            // featured
            const featured = item as { symbol: string; name: string };
            return (
              <FeaturedSymbolItem
                key={featured.symbol}
                symbol={featured.symbol}
                name={featured.name}
                onSelect={() => onSelectStock(featured.symbol)}
                highlightMatch={highlightMatch}
                query={query}
                isActive={isActive}
              />
            );
          }
        })}
      </CommandGroup>
    </>
  );
};

export default SearchResultsSection;
