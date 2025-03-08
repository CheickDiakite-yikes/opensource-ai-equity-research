
import { CommandItem } from "@/components/ui/command";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedSymbolItemProps {
  symbol: string;
  name: string;
  onSelect: () => void;
  highlightMatch?: (text: string, query: string) => string;
  query?: string;
  isActive?: boolean;
}

export const FeaturedSymbolItem = ({ 
  symbol, 
  name, 
  onSelect,
  highlightMatch,
  query = "",
  isActive = false
}: FeaturedSymbolItemProps) => {
  return (
    <CommandItem
      onSelect={onSelect}
      className={cn(
        "flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors",
        isActive && "bg-accent/60"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1.5 rounded-full">
          <Sparkles size={12} className="text-primary" />
        </div>
        <div className="flex flex-col">
          <span 
            className="font-medium"
            dangerouslySetInnerHTML={{ 
              __html: highlightMatch ? highlightMatch(symbol, query) : symbol
            }}
          />
          <span 
            className="text-xs text-muted-foreground line-clamp-1"
            dangerouslySetInnerHTML={{ 
              __html: highlightMatch ? highlightMatch(name, query) : name
            }}
          />
        </div>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </CommandItem>
  );
};
