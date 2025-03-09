
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialsTabContent from '../sections/FinancialsTabContent';
import BalanceSheetTabContent from '../sections/BalanceSheetTabContent';
import CashFlowTabContent from '../sections/CashFlowTabContent';
import RatiosTabContent from '../sections/RatiosTabContent';
import GrowthTabContent from '../sections/GrowthTabContent';
import LoadingSkeleton from '../LoadingSkeleton';
import ErrorState from './ErrorState';
import { FinancialData, RatioData } from '@/types';
import { EarningsCall, SECFiling } from '@/types/documentTypes';

interface AnalysisTabsProps {
  symbol: string;
  financials: FinancialData[];
  ratioData: RatioData[];
  transcripts?: EarningsCall[];
  filings?: SECFiling[];
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ 
  symbol, 
  financials, 
  ratioData, 
  transcripts = [], 
  filings = [] 
}) => {
  const [activeTab, setActiveTab] = useState("financials");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Set component as initialized after first render
  useEffect(() => {
    if (!isInitialized) {
      console.log(`AnalysisTabs initialized for ${symbol} with ${financials.length} financial records`);
      setIsInitialized(true);
    }
  }, [isInitialized, symbol, financials.length]);
  
  // Error handling if financials data is missing
  if (!isInitialized) {
    return <LoadingSkeleton />;
  }
  
  if (!financials || financials.length === 0) {
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={() => {}} 
        isRetrying={false} 
        message="No financial data available for this company"
      />
    );
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log(`Changed analysis tab to: ${value}`);
    setActiveTab(value);
  };

  return (
    <Tabs 
      defaultValue="financials" 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="financials">Income</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        <TabsTrigger value="ratios">Ratios</TabsTrigger>
        <TabsTrigger value="growth">Growth</TabsTrigger>
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
        <RatiosTabContent ratioData={ratioData} symbol={symbol} />
      </TabsContent>
      
      <TabsContent value="growth">
        <GrowthTabContent financials={financials} symbol={symbol} />
      </TabsContent>
    </Tabs>
  );
};

export default AnalysisTabs;
