
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialsTabContent from '../sections/FinancialsTabContent';
import BalanceSheetTabContent from '../sections/BalanceSheetTabContent';
import CashFlowTabContent from '../sections/CashFlowTabContent';
import RatiosTabContent from '../sections/RatiosTabContent';
import GrowthTabContent from '../sections/GrowthTabContent';
import { useDirectFinancialData } from '@/hooks/useDirectFinancialData';
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
  financials = [], 
  ratioData = [], 
  transcripts = [], 
  filings = [] 
}) => {
  const [activeTab, setActiveTab] = useState("financials");
  
  // Error handling if financials data is missing or empty
  if (!financials || financials.length === 0) {
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={() => {}} 
        isRetrying={false} 
        customMessage="No financial data available for analysis. Please try another ticker symbol or check back later."
      />
    );
  }

  return (
    <Tabs defaultValue="financials" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
