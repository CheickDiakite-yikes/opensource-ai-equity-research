
import { CommandItem } from "@/components/ui/command";
import { History, ChevronRight } from "lucide-react";

interface RecentSearchItemProps {
  symbol: string;
  onSelect: () => void;
  highlightMatch?: (text: string, query: string) => string;
  query?: string;
}

export const RecentSearchItem = ({ 
  symbol, 
  onSelect,
  highlightMatch,
  query = ""
}: RecentSearchItemProps) => {
  return (
    <CommandItem
      onSelect={onSelect}
      className="flex items-center justify-between py-3 px-4 hover:bg-accent/50"
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
