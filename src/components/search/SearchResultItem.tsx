
import { StockQuote } from "@/types";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SearchResultItemProps {
  stock: StockQuote;
  onSelect: () => void;
  highlightMatch?: (text: string, query: string) => string;
  query?: string;
  isActive?: boolean;
}

export const SearchResultItem = ({ 
  stock, 
  onSelect,
  highlightMatch,
  query = "",
  isActive = false
}: SearchResultItemProps) => {
  // Format market cap in a readable way
  const formatMarketCap = (marketCap: number): string => {
    if (!marketCap) return "";
    if (marketCap >= 1_000_000_000_000) {
      return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
    } else if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  // Get badge based on category
  const getCategoryBadge = () => {
    if (stock.category === "Exact Match") {
      return <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-500/20 text-green-700 dark:text-green-400">Exact</span>;
    } else if (stock.isCommonTicker) {
      return <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">Popular</span>;
    } else {
      return <span className="text-xs px-1.5 py-0.5 rounded-md bg-secondary/20 text-secondary-foreground">Stock</span>;
    }
  };

  return (
    <CommandItem
      onSelect={onSelect}
      className={cn(
        "flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors",
        isActive && "bg-accent/60"
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span 
            className="font-semibold"
            dangerouslySetInnerHTML={{ 
              __html: highlightMatch ? highlightMatch(stock.symbol, query) : stock.symbol
            }}
          />
          {getCategoryBadge()}
        </div>
        <span 
          className="text-xs text-muted-foreground line-clamp-1"
          dangerouslySetInnerHTML={{ 
            __html: highlightMatch ? highlightMatch(stock.name, query) : stock.name
          }}
        />
        {stock.marketCap > 0 && !stock.isCommonTicker && (
          <span className="text-xs text-muted-foreground mt-0.5">
            Market Cap: {formatMarketCap(stock.marketCap)}
          </span>
        )}
      </div>
      {stock.price > 0 && !stock.isCommonTicker && (
        <div className="flex flex-col items-end">
          <span className="font-medium">${stock.price.toFixed(2)}</span>
          <span 
            className={cn(
              "text-xs flex items-center gap-1",
              stock.changesPercentage > 0 ? "text-green-600 dark:text-green-500" : 
              stock.changesPercentage < 0 ? "text-red-600 dark:text-red-500" : "text-muted-foreground"
            )}
          >
            {stock.changesPercentage > 0 ? (
              <TrendingUp size={12} className="inline" />
            ) : stock.changesPercentage < 0 ? (
              <TrendingDown size={12} className="inline" />
            ) : (
              <Minus size={12} className="inline" />
            )}
            {stock.changesPercentage > 0 ? "+" : ""}{stock.changesPercentage.toFixed(2)}%
          </span>
        </div>
      )}
    </CommandItem>
  );
};
