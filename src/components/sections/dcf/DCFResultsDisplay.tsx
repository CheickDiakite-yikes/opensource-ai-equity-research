
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
  // Calculate upside percentage - (intrinsic value / current price - 1) * 100
  const upside = currentPrice > 0 ? ((customDCFResult.equityValuePerShare / currentPrice) - 1) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-lg bg-muted/30 border border-border"
      >
        <div className="mb-6">
          <div className="text-sm text-muted-foreground">Equity Value Per Share</div>
          <div className="text-4xl font-bold">
            {formatCurrency(customDCFResult.equityValuePerShare)}
          </div>
          <div className={`text-sm font-medium ${
            (upside > 0) 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {Math.abs(upside).toFixed(2)}% {upside > 0 ? 'Upside' : 'Downside'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Current Price:</div>
            <div className="font-medium">{formatCurrency(currentPrice)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">WACC:</div>
            <div className="font-medium">{formatPercentage(customDCFResult.wacc)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Enterprise Value:</div>
            <div className="font-medium">{formatLargeNumber(customDCFResult.enterpriseValue)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Equity Value:</div>
            <div className="font-medium">{formatLargeNumber(customDCFResult.equityValue)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Revenue Growth:</div>
            <div className="font-medium">{formatPercentage(customDCFResult.revenuePercentage)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Long Term Growth:</div>
            <div className="font-medium">{formatPercentage(customDCFResult.longTermGrowthRate)}</div>
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Key DCF Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Terminal Value</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.terminalValue)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Present Terminal Value</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.presentTerminalValue)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">PV of FCF</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.pvLfcf)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Sum PV of FCF</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.sumPvLfcf)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Additional Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Free Cash Flow</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.freeCashFlow)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">FCF T1</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.freeCashFlowT1)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Net Debt</div>
            <div className="text-sm font-medium">{formatLargeNumber(customDCFResult.netDebt)}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Op. Cash Flow %</div>
            <div className="text-sm font-medium">{formatPercentage(customDCFResult.operatingCashFlowPercentage)}</div>
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
