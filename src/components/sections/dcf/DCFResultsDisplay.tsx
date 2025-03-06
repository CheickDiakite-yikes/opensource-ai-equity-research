
import React from "react";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { formatCurrency, formatLargeNumber, formatPercentage } from "@/utils/financial/formatUtils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { DCFType } from "@/services/api/analysis/dcfService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DCFResultsDisplayProps {
  customDCFResult: CustomDCFResult;
  projectedData: YearlyDCFData[];
  currentPrice: number;
  dcfModel: DCFType;
}

const DCFResultsDisplay: React.FC<DCFResultsDisplayProps> = ({ 
  customDCFResult, 
  projectedData,
  currentPrice,
  dcfModel
}) => {
  // Calculate upside/downside
  const upside = ((customDCFResult.equityValuePerShare / currentPrice) - 1) * 100;
  const isUndervalued = upside > 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Current Market Price</div>
          <div className="text-2xl font-bold">{formatCurrency(currentPrice)}</div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">DCF Intrinsic Value</div>
          <div className="text-2xl font-bold">{formatCurrency(customDCFResult.equityValuePerShare)}</div>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${isUndervalued ? 'bg-green-50' : 'bg-red-50'} flex items-center`}>
        <div className="flex-1">
          <div className={`text-sm ${isUndervalued ? 'text-green-700' : 'text-red-700'} opacity-80 mb-1`}>
            {isUndervalued ? 'Potential Upside' : 'Potential Downside'}
          </div>
          <div className={`text-xl font-bold flex items-center ${isUndervalued ? 'text-green-700' : 'text-red-700'}`}>
            {isUndervalued ? (
              <ArrowUp className="h-5 w-5 mr-1" />
            ) : (
              <ArrowDown className="h-5 w-5 mr-1" />
            )}
            <span>{Math.abs(upside).toFixed(2)}%</span>
          </div>
        </div>
        <div className="flex-1 border-l border-gray-200 pl-4">
          <div className="text-sm text-muted-foreground mb-1">Valuation</div>
          <div className={`text-lg font-semibold ${isUndervalued ? 'text-green-700' : 'text-red-700'}`}>
            {isUndervalued ? 'Undervalued' : 'Overvalued'}
          </div>
        </div>
      </div>
      
      {(dcfModel === DCFType.CUSTOM_ADVANCED || dcfModel === DCFType.CUSTOM_LEVERED) && (
        <>
          <div className="pt-2">
            <h3 className="text-base font-medium mb-3">Key DCF Parameters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">WACC</div>
                <div className="font-medium">{formatPercentage(customDCFResult.wacc)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Terminal Growth</div>
                <div className="font-medium">{formatPercentage(customDCFResult.longTermGrowthRate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tax Rate</div>
                <div className="font-medium">{formatPercentage(customDCFResult.taxRate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Revenue Growth</div>
                <div className="font-medium">{formatPercentage(customDCFResult.revenuePercentage/100)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">EBITDA Margin</div>
                <div className="font-medium">{formatPercentage(customDCFResult.ebitdaPercentage/100)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="font-medium">{customDCFResult.beta.toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          {projectedData.length > 0 && (
            <div className="pt-3">
              <h3 className="text-base font-medium mb-3">Projected Cash Flows</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>EBIT</TableHead>
                      <TableHead>EBITDA</TableHead>
                      <TableHead>Free Cash Flow</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectedData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data.year}</TableCell>
                        <TableCell>{formatLargeNumber(data.revenue)}</TableCell>
                        <TableCell>{formatLargeNumber(data.ebit)}</TableCell>
                        <TableCell>{formatLargeNumber(data.ebitda)}</TableCell>
                        <TableCell>{formatLargeNumber(data.freeCashFlow)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DCFResultsDisplay;
