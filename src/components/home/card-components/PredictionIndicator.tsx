
import React from "react";

interface PredictionIndicatorProps {
  currentPrice: number;
  predictedPrice: number | null;
  isLoading: boolean;
}

const PredictionIndicator = ({ 
  currentPrice, 
  predictedPrice, 
  isLoading 
}: PredictionIndicatorProps) => {
  if (isLoading) {
    return (
      <div className="px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium">
        Loading...
      </div>
    );
  }
  
  if (!predictedPrice) {
    return (
      <div className="px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium">
        N/A
      </div>
    );
  }
  
  // Calculate percentage difference
  const priceDiff = ((predictedPrice - currentPrice) / currentPrice) * 100;
  
  // Format the difference to ensure we show at least 2 decimal places and never exactly 0.00%
  const formattedDiff = Math.abs(priceDiff) < 0.01 
    ? (priceDiff >= 0 ? "+0.01%" : "-0.01%")
    : (priceDiff >= 0 ? `+${priceDiff.toFixed(2)}%` : `${priceDiff.toFixed(2)}%`);
    
  const isPositive = priceDiff >= 0;
  
  return (
    <div 
      className={`px-2.5 py-1.5 rounded-md ${isPositive ? "bg-blue-500/20 text-blue-600" : "bg-red-500/20 text-red-600"} text-sm font-medium`}
      title={`AI predicts a ${Math.abs(priceDiff).toFixed(2)}% ${isPositive ? 'increase' : 'decrease'} in 1 year`}
    >
      {formattedDiff}
    </div>
  );
};

export default PredictionIndicator;
