
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SensitivityRow {
  growth: string;
  values: number[];
}

interface SensitivityAnalysisTableProps {
  headers: string[];
  rows: SensitivityRow[];
  currentPrice: number;
}

const SensitivityAnalysisTable: React.FC<SensitivityAnalysisTableProps> = ({ 
  headers, 
  rows, 
  currentPrice 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensitivity Analysis</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Stock price in USD based on different inputs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          The table below shows how changes in the discount rate (WACC) and terminal growth rate affect the estimated stock price.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium p-2">Growth / WACC</th>
                {headers.slice(1).map((header, i) => (
                  <th key={i} className="text-center font-medium p-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-2 font-medium">{row.growth}</td>
                  {row.values.map((value, j) => {
                    const percentChange = ((value - 95) / 95) * 100;
                    const basePrice = currentPrice;
                    const adjustedPrice = basePrice * (1 + percentChange / 100);
                    
                    return (
                      <td 
                        key={j} 
                        className={`p-2 text-center ${
                          adjustedPrice > currentPrice 
                            ? 'bg-green-50 text-green-700' 
                            : adjustedPrice < currentPrice 
                              ? 'bg-red-50 text-red-700' 
                              : ''
                        }`}
                      >
                        {formatCurrency(parseFloat(adjustedPrice.toFixed(2)))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensitivityAnalysisTable;
