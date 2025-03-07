
import { StockQuote } from "@/types";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchResultItemProps {
  stock: StockQuote;
  onSelect: () => void;
}

export const SearchResultItem = ({ stock, onSelect }: SearchResultItemProps) => {
  return (
    <CommandItem
      onSelect={onSelect}
      className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{stock.symbol}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
            {stock.isCommonTicker ? "Popular" : "Stock"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground line-clamp-1">{stock.name}</span>
      </div>
      {stock.price && !stock.isCommonTicker && (
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
  );
};
