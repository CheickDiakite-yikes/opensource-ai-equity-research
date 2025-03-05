
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TTMRatioDisplay from "./ratios/TTMRatioDisplay";

interface RatioData {
  year: string;
  peRatio: number;
  pbRatio: number;
  roe: number;
  roa: number;
  currentRatio: number;
  debtEquity: number;
  grossMargin: number;
  netMargin: number;
}

interface RatiosTabContentProps {
  symbol: string;
  ratioData: RatioData[];
}

const RatiosTabContent: React.FC<RatiosTabContentProps> = ({ symbol, ratioData }) => {
  // Group the ratio data by year
  const groupedData = ratioData.reduce((acc: Record<string, RatioData>, item) => {
    acc[item.year] = item;
    return acc;
  }, {});

  // Sort years in descending order
  const years = Object.keys(groupedData).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {years.slice(0, 3).map((year) => (
          <Card key={year}>
            <CardHeader>
              <CardTitle>{year}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">P/E Ratio</span>
                <span className="font-medium">{groupedData[year].peRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">P/B Ratio</span>
                <span className="font-medium">{groupedData[year].pbRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ROE</span>
                <span className="font-medium">{groupedData[year].roe.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ROA</span>
                <span className="font-medium">{groupedData[year].roa.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Ratio</span>
                <span className="font-medium">{groupedData[year].currentRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Debt/Equity</span>
                <span className="font-medium">{groupedData[year].debtEquity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Margin</span>
                <span className="font-medium">{groupedData[year].grossMargin.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Margin</span>
                <span className="font-medium">{groupedData[year].netMargin.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add TTM Ratio Display Component */}
        <TTMRatioDisplay symbol={symbol} />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Profitability Trends</h3>
        <div className="h-80 w-full">
          {/* Your existing chart component for profitability trends */}
        </div>
      </div>
    </div>
  );
};

export default RatiosTabContent;
