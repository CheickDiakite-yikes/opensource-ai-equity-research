
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  percentage: number;
  timeframe: string;
  className?: string;
  compact?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  percentage,
  timeframe,
  className,
  compact = false
}) => {
  const isPositive = percentage >= 0;
  const formattedPercentage = `${isPositive ? '+' : ''}${percentage.toFixed(2)}%`;
  
  return (
    <div 
      className={cn(
        "flex flex-col items-end",
        className
      )}
    >
      <div 
        className={cn(
          "flex items-center justify-center rounded-full",
          compact ? "h-6 w-12 text-xs" : "h-7 w-16 text-sm",
          isPositive 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}
      >
        <span className={compact ? "text-[10px] font-medium" : "text-xs font-medium"}>
          {formattedPercentage}
        </span>
      </div>
      
      {!compact && (
        <div className="flex items-center mt-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className="text-xs text-muted-foreground">{timeframe}</span>
        </div>
      )}
    </div>
  );
};

export default TrendIndicator;
