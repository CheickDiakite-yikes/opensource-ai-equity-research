
import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  featuredSymbols?: {symbol: string, name: string}[];
}

const SearchBar = ({ 
  placeholder = "Search ticker symbol...", 
  className,
  value,
  onChange,
  onSearch,
  onKeyDown,
  isLoading = false,
  featuredSymbols = []
}: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState<{symbol: string, name: string}[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length < 1) {
      setFilteredSymbols([]);
      return;
    }
    
    // Filter the featured symbols based on the input
    const filtered = featuredSymbols.filter(
      item => 
        item.symbol.toLowerCase().includes(value.toLowerCase()) || 
        item.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSymbols(filtered.slice(0, 5)); // Limit to 5 results
  }, [value, featuredSymbols]);

  useEffect(() => {
    // Handle clicks outside of the search component to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
    onSearch();
  };

  return (
    <div 
      ref={searchRef}
      className={cn(
        "relative w-full max-w-lg",
        className
      )}
    >
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full h-10 pl-10 pr-4 rounded-lg border shadow-sm transition-all focus:ring-1 focus:ring-primary"
          disabled={isLoading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-14 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-muted"
            onClick={() => onChange("")}
            disabled={isLoading}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
        
        <Button
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 rounded-md px-3"
          size="sm"
          onClick={onSearch}
          disabled={isLoading || !value.trim()}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="mr-1">Search</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
      
      {isOpen && filteredSymbols.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-md border shadow-lg z-10 py-1">
          {filteredSymbols.map((item) => (
            <button
              key={item.symbol}
              className="w-full px-4 py-2 text-left hover:bg-muted flex justify-between items-center"
              onClick={() => handleSelectSymbol(item.symbol)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.symbol}</span>
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
