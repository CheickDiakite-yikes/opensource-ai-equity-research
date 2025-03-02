
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";

interface DCFTabContentProps {
  financials: any[];
  symbol: string;
}

const DCFTabContent: React.FC<DCFTabContentProps> = ({ financials, symbol }) => {
  // In a real app, this would be calculated using actual DCF model
  const mockDCFData = {
    intrinsicValue: financials[0]?.revenue ? (financials[0].netIncome * 15) : 0,
    assumptions: {
      growthRate: "8.5% (first 5 years), 3% (terminal)",
      discountRate: "10.5%",
      terminalMultiple: "15x",
      taxRate: "21%"
    },
    projections: [1, 2, 3, 4, 5].map(year => ({
      year: `Year ${year}`,
      revenue: financials[0]?.revenue ? (financials[0].revenue * Math.pow(1.085, year)) : 0,
      ebit: financials[0]?.operatingIncome ? (financials[0].operatingIncome * Math.pow(1.09, year)) : 0,
      fcf: financials[0]?.netIncome ? (financials[0].netIncome * 0.8 * Math.pow(1.075, year)) : 0
    })),
    sensitivity: {
      headers: ["", "9.5%", "10.0%", "10.5%", "11.0%", "11.5%"],
      rows: [
        { growth: "2.0%", values: [95, 90, 85, 80, 75] },
        { growth: "2.5%", values: [100, 95, 90, 85, 80] },
        { growth: "3.0%", values: [105, 100, 95, 90, 85] },
        { growth: "3.5%", values: [110, 105, 100, 95, 90] },
        { growth: "4.0%", values: [115, 110, 105, 100, 95] }
      ]
    }
  };

  const currentPrice = financials[0]?.price || 100;
  const dcfValue = mockDCFData.intrinsicValue;
  const upside = ((dcfValue / currentPrice) - 1) * 100;
  
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div>{mockDCFData.assumptions.growthRate}</div>
                  <div className="text-muted-foreground">Discount Rate (WACC):</div>
                  <div>{mockDCFData.assumptions.discountRate}</div>
                  <div className="text-muted-foreground">Terminal Multiple:</div>
                  <div>{mockDCFData.assumptions.terminalMultiple}</div>
                  <div className="text-muted-foreground">Tax Rate:</div>
                  <div>{mockDCFData.assumptions.taxRate}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Projected Cash Flows</CardTitle>
            <p className="text-xs text-muted-foreground">All figures in millions (USD)</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium py-2">Period</th>
                    <th className="text-right font-medium py-2">Revenue</th>
                    <th className="text-right font-medium py-2">EBIT</th>
                    <th className="text-right font-medium py-2">Free Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDCFData.projections.map((proj, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{proj.year}</td>
                      <td className="text-right py-2">{formatLargeNumber(proj.revenue)}</td>
                      <td className="text-right py-2">{formatLargeNumber(proj.ebit)}</td>
                      <td className="text-right py-2">{formatLargeNumber(proj.fcf)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            The table below shows how changes in the discount rate (WACC) and terminal growth rate affect the estimated intrinsic value.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-2">Growth / WACC</th>
                  {mockDCFData.sensitivity.headers.slice(1).map((header, i) => (
                    <th key={i} className="text-center font-medium p-2">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockDCFData.sensitivity.rows.map((row, i) => (
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
                          {formatCurrency(adjustedPrice)}
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
    </div>
  );
};

export default DCFTabContent;
