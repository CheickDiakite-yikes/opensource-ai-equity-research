
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  percentage: number;
  timeframe?: string;
}

const TrendIndicator = ({ percentage, timeframe = "24h" }: TrendIndicatorProps) => {
  // Handle zero, very small, or undefined percentages
  if (!percentage || Math.abs(percentage) < 0.01) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-200/60 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 w-fit">
        <Minus className="h-4 w-4" />
        <span className="font-semibold text-sm">0.00%</span>
        {timeframe && <span className="text-xs opacity-70">{timeframe}</span>}
      </div>
    );
  }
  
  const isPositive = percentage > 0;
  const absPercentage = Math.abs(percentage);
  
  return (
    <div 
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${
        isPositive ? "bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400" : 
                    "bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-400"
      } w-fit`}
    >
      {isPositive ? 
        <TrendingUp className="h-4 w-4" /> : 
        <TrendingDown className="h-4 w-4" />
      }
      <span className="font-semibold text-sm">
        {isPositive ? 
          `+${absPercentage.toFixed(2)}%` : 
          `-${absPercentage.toFixed(2)}%`
        }
      </span>
      {timeframe && <span className="text-xs opacity-70">{timeframe}</span>}
    </div>
  );
};

export default TrendIndicator;
