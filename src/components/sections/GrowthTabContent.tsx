
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import GrowthRateCard from "@/components/cards/GrowthRateCard";
import GrowthChart from "@/components/charts/GrowthChart";
import GrowthInsightsCard from "@/components/cards/GrowthInsightsCard";
import { calculateYoYGrowth, getGrowthRates } from "@/utils/financialDataUtils";

interface GrowthTabContentProps {
  financials: any[];
  symbol: string;
}

const GrowthTabContent: React.FC<GrowthTabContentProps> = ({ financials, symbol }) => {
  const growthRates = getGrowthRates(financials);
  
  // Calculate YoY growth for the latest period
  const calculateLatestYoY = (metric: string) => {
    if (financials.length < 2) return 0;
    
    const sorted = [...financials].sort((a, b) => {
      return new Date(b.year).getTime() - new Date(a.year).getTime();
    });
    
    const current = sorted[0][metric];
    const previous = sorted[1][metric];
    
    return calculateYoYGrowth(current, previous);
  };
  
  const revenueYoY = calculateLatestYoY('revenue');
  const netIncomeYoY = calculateLatestYoY('netIncome');
  const cashFlowYoY = calculateLatestYoY('operatingCashFlow');
  
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GrowthRateCard 
          title="Revenue Growth" 
          cagrValue={growthRates.revenueGrowth} 
          yoyValue={revenueYoY} 
        />
        <GrowthRateCard 
          title="Net Income Growth" 
          cagrValue={growthRates.netIncomeGrowth} 
          yoyValue={netIncomeYoY} 
        />
        <GrowthRateCard 
          title="Cash Flow Growth" 
          cagrValue={growthRates.operatingCashFlowGrowth} 
          yoyValue={cashFlowYoY} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue and Income Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthChart data={financials} />
          </CardContent>
        </Card>
        
        <GrowthInsightsCard symbol={symbol} growthRates={growthRates} />
      </div>
    </div>
  );
};

export default GrowthTabContent;
