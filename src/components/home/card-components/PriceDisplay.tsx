
import React from "react";
import { Banknote, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number | null;
  label: string;
  isLoading: boolean;
  error: boolean;
  iconColor?: string;
  className?: string;
  compact?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  label,
  isLoading,
  error,
  iconColor = "text-blue-500",
  className,
  compact = false
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center space-x-1.5">
        <Banknote className={cn(
          iconColor, 
          compact ? "h-3 w-3" : "h-3.5 w-3.5"
        )} />
        <span className={`text-muted-foreground ${compact ? 'text-xs' : 'text-xs'}`}>{label}</span>
      </div>
      
      {isLoading ? (
        <div className="flex items-center space-x-1 mt-0.5">
          <Loader2 className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} animate-spin text-muted-foreground`} />
          <span className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</span>
        </div>
      ) : error ? (
        <span className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>Unavailable</span>
      ) : (
        <span className={cn(
          "font-semibold",
          compact ? "text-base" : "text-lg",
        )}>
          ${price !== null ? price.toFixed(2) : '--'}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
