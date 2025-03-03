
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import GrowthChart from "@/components/charts/GrowthChart";
import GrowthRateCard from "@/components/cards/GrowthRateCard";
import GrowthInsightsCard from "@/components/cards/GrowthInsightsCard";
import { calculateCAGR, calculateGrowth, compareToIndustry } from "@/utils/financialDataUtils";
import { EarningsCall, SECFiling } from "@/types";

interface GrowthTabContentProps {
  financials: any[];
  symbol?: string;
  transcripts?: EarningsCall[];
  filings?: SECFiling[];
}

const GrowthTabContent: React.FC<GrowthTabContentProps> = ({ 
  financials,
  symbol = "",
  transcripts = [],
  filings = []
}) => {
  const revenueGrowthData = calculateGrowth(financials, 'revenue');
  const netIncomeGrowthData = calculateGrowth(financials, 'netIncome');
  
  const revenueCagr = calculateCAGR(financials, 'revenue');
  const epsCagr = calculateCAGR(financials, 'eps');
  const netIncomeCagr = calculateCAGR(financials, 'netIncome');

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart 
          data={revenueGrowthData} 
          title="Revenue Growth" 
          color="#3B82F6" 
        />
        
        <GrowthChart 
          data={netIncomeGrowthData} 
          title="Earnings Growth" 
          color="#10B981" 
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>5-Year Growth Rates</CardTitle>
        </CardHeader>
        <CardContent>
          {financials.length >= 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GrowthRateCard
                title="Revenue CAGR"
                value={revenueCagr}
                industryAvg={8.5}
                comparison={compareToIndustry(revenueCagr, 8.5)}
              />
              
              <GrowthRateCard
                title="EPS CAGR"
                value={epsCagr}
                industryAvg={9.4}
                comparison={compareToIndustry(epsCagr, 9.4)}
              />
              
              <GrowthRateCard
                title="Net Income CAGR"
                value={netIncomeCagr}
                industryAvg={7.2}
                comparison={compareToIndustry(netIncomeCagr, 7.2)}
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              Insufficient historical data to calculate growth rates
            </p>
          )}
        </CardContent>
      </Card>

      {symbol && (
        <GrowthInsightsCard 
          symbol={symbol}
          transcripts={transcripts || []}
          filings={filings || []}
        />
      )}
    </div>
  );
};

export default GrowthTabContent;
