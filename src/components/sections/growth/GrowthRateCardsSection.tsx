
import React from 'react';
import { GrowthRateCard } from '../../cards/GrowthRateCard';

interface GrowthRateCardsSectionProps {
  revenueCAGR: number;
  netIncomeCAGR: number;
  ebitdaCAGR: number;
  revenueYoY: number;
  netIncomeYoY: number;
  ebitdaYoY: number;
}

export const GrowthRateCardsSection: React.FC<GrowthRateCardsSectionProps> = ({
  revenueCAGR,
  netIncomeCAGR,
  ebitdaCAGR,
  revenueYoY,
  netIncomeYoY,
  ebitdaYoY
}) => {
  return (
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
  );
};
