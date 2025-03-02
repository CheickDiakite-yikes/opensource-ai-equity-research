
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DCFValuationSummaryProps {
  dcfValue: number;
  upside: number;
  assumptions: {
    growthRate: string;
    discountRate: string;
    terminalMultiple: string;
    taxRate: string;
  };
}

const DCFValuationSummary: React.FC<DCFValuationSummaryProps> = ({ 
  dcfValue, 
  upside, 
  assumptions 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DCF Valuation Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Intrinsic Value</div>
              <div className="text-2xl font-bold">{formatCurrency(dcfValue)}</div>
            </div>
            <div className={`p-4 rounded-lg ${upside >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="text-sm opacity-80 mb-1">Potential Upside</div>
              <div className="text-2xl font-bold">{upside.toFixed(1)}%</div>
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
      </CardContent>
    </Card>
  );
};

export default DCFValuationSummary;
