
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearButtonProps {
  query: string;
  isLoading: boolean;
  onClear: () => void;
}

export const ClearButton = ({ query, isLoading, onClear }: ClearButtonProps) => {
  if (isLoading) {
    return (
      <div className="absolute right-3 flex items-center">
        <Loader2 size={18} className="animate-spin text-primary" />
      </div>
    );
  }
  
  if (query.length > 0) {
    return (
      <div className="absolute right-3 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={16} strokeWidth={2.5} />
        </Button>
      </div>
    );
  }
  
  return null;
};
