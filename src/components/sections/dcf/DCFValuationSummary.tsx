
import React from "react";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";
import { formatCurrency, formatPercentage } from "@/utils/financial/formatUtils";

export interface DCFValuationSummaryProps {
  intrinsicValue: number;
  currentPrice: number;
  assumptions: {
    growthRate: string;
    discountRate: string;
    terminalMultiple: string;
    taxRate: string;
  };
  symbol: string;
}

const DCFValuationSummary: React.FC<DCFValuationSummaryProps> = ({
  intrinsicValue,
  currentPrice,
  assumptions,
  symbol
}) => {
  const upside = ((intrinsicValue - currentPrice) / currentPrice) * 100;
  const isUndervalued = intrinsicValue > currentPrice;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">DCF Valuation Summary</h3>
      
      <div className="flex items-center space-x-4">
        <div className="text-3xl font-bold">
          {formatCurrency(intrinsicValue)}
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded ${isUndervalued ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isUndervalued ? '🔼' : '🔽'} {Math.abs(upside).toFixed(1)}% {isUndervalued ? 'Undervalued' : 'Overvalued'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500">Current Price</span>
          <span className="font-medium">{formatCurrency(currentPrice)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Potential Upside</span>
          <span className={`font-medium ${isUndervalued ? 'text-green-600' : 'text-red-600'}`}>
            {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="pt-2">
        <h4 className="text-sm font-medium mb-2">Key Assumptions</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Growth Rate:</span>
            <span>{assumptions.growthRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Discount Rate:</span>
            <span>{assumptions.discountRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Terminal Multiple:</span>
            <span>{assumptions.terminalMultiple}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax Rate:</span>
            <span>{assumptions.taxRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCFValuationSummary;
