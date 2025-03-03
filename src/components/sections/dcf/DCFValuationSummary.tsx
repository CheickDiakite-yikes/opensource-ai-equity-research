
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/financialDataUtils";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

interface DCFValuationSummaryProps {
  dcfValue: number;
  upside: number;
  assumptions: {
    growthRate: string;
    discountRate: string;
    terminalMultiple: string;
    taxRate: string;
  };
  isLoading?: boolean;
}

const DCFValuationSummary: React.FC<DCFValuationSummaryProps> = ({ 
  dcfValue, 
  upside, 
  assumptions,
  isLoading = false
}) => {
  // Format upside percentage with 2 decimal places and ensure it's positive for display
  const formattedUpside = Math.abs(upside).toFixed(2);
  const isPositive = upside >= 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>DCF Valuation Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Intrinsic Value</div>
                <div className="text-2xl font-bold">{formatCurrency(dcfValue)}</div>
              </div>
              <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="text-sm opacity-80 mb-1">
                  {isPositive ? 'Potential Upside' : 'Potential Downside'}
                </div>
                <div className="text-2xl font-bold flex items-center">
                  {isPositive ? (
                    <ArrowUp className="h-5 w-5 mr-1 text-green-700" />
                  ) : (
                    <ArrowDown className="h-5 w-5 mr-1 text-red-700" />
                  )}
                  <span>{formattedUpside}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Key Assumptions</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Growth Rate:</div>
                <div>{assumptions.growthRate}</div>
                <div className="text-muted-foreground">Discount Rate (WACC):</div>
                <div>{assumptions.discountRate}</div>
                <div className="text-muted-foreground">Terminal Multiple:</div>
                <div>{assumptions.terminalMultiple}</div>
                <div className="text-muted-foreground">Tax Rate:</div>
                <div>{assumptions.taxRate}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DCFValuationSummary;
