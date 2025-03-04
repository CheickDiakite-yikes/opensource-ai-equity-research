
import React from 'react';
import { GrowthInsightsCard } from '../cards/GrowthInsightsCard';
import { 
  calculateCAGR, 
  calculateYoYGrowth,
  transformFinancialsToGrowthData
} from '../../utils/financial';
import type { FinancialData } from '../../types/financialDataTypes';
import { GrowthRateCardsSection } from './growth/GrowthRateCardsSection';
import { GrowthTrendsSection } from './growth/GrowthTrendsSection';
import { InsufficientDataMessage } from './growth/InsufficientDataMessage';

export interface GrowthTabContentProps {
  financials: FinancialData[];
  symbol: string;
}

export const GrowthTabContent: React.FC<GrowthTabContentProps> = ({ financials, symbol }) => {
  if (!financials || financials.length < 2) {
    return <InsufficientDataMessage />;
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

  // Transform the data for the growth chart
  const revenueGrowthData = transformFinancialsToGrowthData(financials, 'revenue');

  return (
    <div className="p-4 space-y-6">
      <GrowthRateCardsSection 
        revenueCAGR={revenueCAGR}
        netIncomeCAGR={netIncomeCAGR}
        ebitdaCAGR={ebitdaCAGR}
        revenueYoY={revenueYoY}
        netIncomeYoY={netIncomeYoY}
        ebitdaYoY={ebitdaYoY}
      />

      <GrowthTrendsSection data={revenueGrowthData} />

      <GrowthInsightsCard symbol={symbol} growth={growthRates} />
    </div>
  );
};

export default GrowthTabContent;
