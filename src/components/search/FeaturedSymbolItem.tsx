
import { CommandItem } from "@/components/ui/command";
import { ChevronRight } from "lucide-react";

interface FeaturedSymbolItemProps {
  symbol: string;
  name: string;
  onSelect: () => void;
}

export const FeaturedSymbolItem = ({ symbol, name, onSelect }: FeaturedSymbolItemProps) => {
  return (
    <CommandItem
      onSelect={onSelect}
      className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{symbol}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">Popular</span>
        </div>
        <span className="text-xs text-muted-foreground line-clamp-1">{name}</span>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </CommandItem>
  );
};
