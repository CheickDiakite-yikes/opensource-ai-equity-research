
import React from "react";
import { DollarSign, AlertTriangle } from "lucide-react";

interface PriceDisplayProps {
  price: number | null;
  label: string;
  isLoading: boolean;
  error?: boolean;
  className?: string;
  iconColor?: string;
}

const PriceDisplay = ({ 
  price, 
  label, 
  isLoading, 
  error = false,
  className = "",
  iconColor = "text-blue-500"
}: PriceDisplayProps) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <div className="flex items-center">
        {isLoading ? (
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        ) : error ? (
          <div className="flex items-center text-amber-500">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm">Error</span>
          </div>
        ) : price !== null ? (
          <>
            <DollarSign className={`h-4 w-4 mr-1 ${iconColor}`} />
            <span className="font-bold text-lg">{price.toFixed(2)}</span>
          </>
        ) : (
          <span className="text-sm text-slate-500">N/A</span>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
