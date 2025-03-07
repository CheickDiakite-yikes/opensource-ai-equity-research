
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
  const commandRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleSelectStock = (symbol: string) => {
    setIsOpen(false);
    navigate(`/stock/${symbol}`);
  };

  return (
    <div 
      className={cn(
        "relative w-full max-w-2xl mx-auto",
        className
      )}
    >
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full h-12 pl-10 pr-4 rounded-lg border-input bg-background text-foreground shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        {query.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
          >
            ×
          </Button>
        )}
      </div>
      
      {isOpen && (
        <Command 
          ref={commandRef}
          className="absolute top-full mt-1 w-full rounded-lg border shadow-md bg-popover z-10 overflow-hidden"
        >
          <CommandList>
            <CommandInput placeholder="Search for stocks..." value={query} onValueChange={handleSearch} />
            
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            
            <CommandEmpty>
              {filteredFeaturedSymbols.length > 0 ? (
                <div className="py-2 text-sm text-muted-foreground">
                  No API results found. Try these:
                </div>
              ) : (
                "No results found."
              )}
            </CommandEmpty>
            
            {/* API Results */}
            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    onSelect={() => handleSelectStock(stock.symbol)}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground">{stock.name}</span>
                    </div>
                    {stock.price && (
                      <div className="flex flex-col items-end">
                        <span>${stock.price.toFixed(2)}</span>
                        <span 
                          className={cn(
                            "text-xs",
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
            {filteredFeaturedSymbols.length > 0 && results.length === 0 && (
              <CommandGroup heading="Popular Stocks">
                {filteredFeaturedSymbols.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    onSelect={() => handleSelectStock(stock.symbol)}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground">{stock.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      )}
    </div>
  );
};

export default SearchBar;
