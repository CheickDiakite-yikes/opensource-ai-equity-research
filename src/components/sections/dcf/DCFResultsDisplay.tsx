
import React from "react";
import { formatCurrency, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { motion } from "framer-motion";
import { CustomDCFResult } from "@/types/aiAnalysisTypes";

interface DCFResultsDisplayProps {
  customDCFResult: CustomDCFResult;
  currentPrice: number;
}

const DCFResultsDisplay: React.FC<DCFResultsDisplayProps> = ({ 
  customDCFResult, 
  currentPrice 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`p-5 rounded-lg ${
            (customDCFResult.equityValuePerShare > currentPrice) 
              ? 'bg-green-50 border border-green-100' 
              : 'bg-red-50 border border-red-100'
          }`}
        >
          <div className="text-sm text-muted-foreground">Intrinsic Value Per Share</div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(customDCFResult.equityValuePerShare)}
          </div>
          <div className={`text-sm font-medium ${
            (customDCFResult.equityValuePerShare > currentPrice) 
              ? 'text-green-700' 
              : 'text-red-700'
          }`}>
            {((customDCFResult.equityValuePerShare / currentPrice - 1) * 100).toFixed(1)}% {customDCFResult.equityValuePerShare > currentPrice ? 'Upside' : 'Downside'}
          </div>
        </motion.div>
        
        <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Current Price:</div>
            <div className="font-medium">{formatCurrency(currentPrice)}</div>
            
            <div className="text-muted-foreground">WACC:</div>
            <div>{formatPercentage(customDCFResult.wacc)}</div>
            
            <div className="text-muted-foreground">Enterprise Value:</div>
            <div>{formatLargeNumber(customDCFResult.enterpriseValue)}</div>
            
            <div className="text-muted-foreground">Equity Value:</div>
            <div>{formatLargeNumber(customDCFResult.equityValue)}</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Terminal Value</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.terminalValue)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">PV of FCF</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.sumPvLfcf)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Terminal FCF</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.freeCashFlowT1)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Net Debt</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.netDebt)}</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Projected Cash Flow (Year {customDCFResult.year})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Revenue</th>
                <th className="text-left p-2">Capital Expenditure</th>
                <th className="text-left p-2">Operating Cash Flow</th>
                <th className="text-left p-2">Free Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">{formatLargeNumber(customDCFResult.revenue)}</td>
                <td className="p-2">{formatLargeNumber(customDCFResult.capitalExpenditure)}</td>
                <td className="p-2">{formatLargeNumber(customDCFResult.operatingCashFlow)}</td>
                <td className="p-2">{formatLargeNumber(customDCFResult.freeCashFlow)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DCFResultsDisplay;
