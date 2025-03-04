
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { GrowthRateCard } from '../cards/GrowthRateCard';
import { GrowthInsightsCard } from '../cards/GrowthInsightsCard';
import GrowthChart from '../charts/GrowthChart'; // Fixed import
import { calculateCAGR, calculateYoYGrowth } from '../../utils/financialDataUtils';
import type { FinancialData } from '../../types/financialDataTypes';

export interface GrowthTabContentProps {
  financials: FinancialData[];
  symbol: string;
}

export const GrowthTabContent: React.FC<GrowthTabContentProps> = ({ financials, symbol }) => {
  if (!financials || financials.length < 2) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium mb-2">Insufficient Data</h3>
        <p className="text-muted-foreground">
          At least 2 years of financial data are required to calculate growth rates.
        </p>
      </div>
    );
  }

  // Calculate growth rates
  const revenueCAGR = calculateCAGR(financials, 'revenue');
  const netIncomeCAGR = calculateCAGR(financials, 'netIncome');
  const ebitdaCAGR = financials[0].ebitda !== undefined ? 
    calculateCAGR(financials, 'ebitda' as keyof FinancialData) : 0;

  const revenueYoY = calculateYoYGrowth(financials, 'revenue');
  const netIncomeYoY = calculateYoYGrowth(financials, 'netIncome');
  const ebitdaYoY = financials[0].ebitda !== undefined ? 
    calculateYoYGrowth(financials, 'ebitda' as keyof FinancialData) : 0;

  const growthRates = {
    revenue: revenueCAGR,
    netIncome: netIncomeCAGR,
    ebitda: ebitdaCAGR
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GrowthRateCard 
          title="Revenue Growth" 
          cagr={revenueCAGR} 
          yoy={revenueYoY} 
        />
        <GrowthRateCard 
          title="Net Income Growth" 
          cagr={netIncomeCAGR} 
          yoy={netIncomeYoY} 
        />
        <GrowthRateCard 
          title="EBITDA Growth" 
          cagr={ebitdaCAGR} 
          yoy={ebitdaYoY} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <GrowthChart data={financials} title="Revenue Growth" color="#10b981" />
        </CardContent>
      </Card>

      <GrowthInsightsCard symbol={symbol} growth={growthRates} />
    </div>
  );
};

export default GrowthTabContent;
