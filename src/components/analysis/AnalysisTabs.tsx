
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialsTabContent from '../sections/FinancialsTabContent';
import BalanceSheetTabContent from '../sections/BalanceSheetTabContent';
import CashFlowTabContent from '../sections/CashFlowTabContent';
import RatiosTabContent from '../sections/RatiosTabContent';
import GrowthTabContent from '../sections/GrowthTabContent';
import DCFTabContent from '../sections/DCFTabContent';
import { useDirectFinancialData } from '@/hooks/useDirectFinancialData';
import LoadingSkeleton from '../LoadingSkeleton';
import ErrorState from './ErrorState';
import { FinancialData } from '@/types';
import { EarningsCall, SECFiling } from '@/types/documentTypes';

interface AnalysisTabsProps {
  symbol: string;
  transcripts?: EarningsCall[];
  filings?: SECFiling[];
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ symbol, transcripts = [], filings = [] }) => {
  const [activeTab, setActiveTab] = useState("financials");
  const { 
    data: financialData, 
    isLoading: isLoadingFinancials,
    isError: isFinancialsError
  } = useDirectFinancialData(symbol);

  // Show loading state if data is being fetched
  if (isLoadingFinancials) {
    return <LoadingSkeleton items={5} />;
  }

  // Show error state if there was an error fetching data
  if (isFinancialsError || !financialData || !financialData.financials || financialData.financials.length === 0) {
    return (
      <ErrorState 
        title="Financial Data Error" 
        message={`We couldn't load financial data for ${symbol}. Please try again later or check if this symbol is valid.`}
      />
    );
  }

  const { financials, keyMetrics, financialRatios } = financialData;

  return (
    <Tabs defaultValue="financials" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-6 mb-4">
        <TabsTrigger value="financials">Income</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        <TabsTrigger value="ratios">Ratios</TabsTrigger>
        <TabsTrigger value="growth">Growth</TabsTrigger>
        <TabsTrigger value="dcf">Valuation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="financials">
        <FinancialsTabContent financials={financials} />
      </TabsContent>
      
      <TabsContent value="balance-sheet">
        <BalanceSheetTabContent financials={financials} />
      </TabsContent>
      
      <TabsContent value="cash-flow">
        <CashFlowTabContent financials={financials} />
      </TabsContent>
      
      <TabsContent value="ratios">
        <RatiosTabContent ratios={financialRatios} metrics={keyMetrics} symbol={symbol} />
      </TabsContent>
      
      <TabsContent value="growth">
        <GrowthTabContent financials={financials} symbol={symbol} />
      </TabsContent>
      
      <TabsContent value="dcf">
        <DCFTabContent 
          symbol={symbol} 
          financials={financials as FinancialData[]} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default AnalysisTabs;
