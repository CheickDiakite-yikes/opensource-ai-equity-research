
import { CommandItem } from "@/components/ui/command";
import { History, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentSearchItemProps {
  symbol: string;
  onSelect: () => void;
  highlightMatch?: (text: string, query: string) => string;
  query?: string;
  isActive?: boolean;
}

export const RecentSearchItem = ({ 
  symbol, 
  onSelect,
  highlightMatch,
  query = "",
  isActive = false
}: RecentSearchItemProps) => {
  return (
    <CommandItem
      onSelect={onSelect}
      className={cn(
        "flex items-center justify-between py-3 px-4 hover:bg-accent/50",
        isActive && "bg-accent/60"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1.5 rounded-full">
          <History size={12} className="text-primary" />
        </div>
        <span 
          className="font-medium"
          dangerouslySetInnerHTML={{ 
            __html: highlightMatch ? highlightMatch(symbol, query) : symbol
          }}
        />
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </CommandItem>
  );
};
