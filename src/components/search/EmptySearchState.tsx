
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptySearchStateProps {
  onSelectStock: (symbol: string) => void;
}

const EmptySearchState = ({ onSelectStock }: EmptySearchStateProps) => {
  return (
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
  );
};

export default EmptySearchState;
