
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
import { toast } from 'sonner';

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
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Mark component as loaded after a short delay to prevent flickering
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Log data availability for debugging
    console.log(`AnalysisTabs for ${symbol} - Data status:`, {
      financialsLength: financials?.length || 0,
      ratioDataLength: ratioData?.length || 0,
      hasFinancials: Boolean(financials && financials.length > 0),
      hasRatios: Boolean(ratioData && ratioData.length > 0),
      transcriptsLength: transcripts?.length || 0,
      filingsLength: filings?.length || 0,
    });
    
    return () => clearTimeout(timer);
  }, [financials, ratioData, symbol, transcripts, filings]);
  
  // Error handling if financials data is missing
  if (!financials || financials.length === 0) {
    console.error(`No financial data available for ${symbol} in AnalysisTabs`);
    toast.error(`Could not load financial data for ${symbol}`, {
      id: 'missing-financial-data',
    });
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={() => {}} 
        isRetrying={false} 
      />
    );
  }

  if (!isLoaded) {
    return <LoadingSkeleton />;
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
      
      <TabsContent value="financials" className="mt-4">
        {activeTab === "financials" && <FinancialsTabContent financials={financials} />}
      </TabsContent>
      
      <TabsContent value="balance-sheet" className="mt-4">
        {activeTab === "balance-sheet" && <BalanceSheetTabContent financials={financials} />}
      </TabsContent>
      
      <TabsContent value="cash-flow" className="mt-4">
        {activeTab === "cash-flow" && <CashFlowTabContent financials={financials} />}
      </TabsContent>
      
      <TabsContent value="ratios" className="mt-4">
        {activeTab === "ratios" && <RatiosTabContent ratioData={ratioData} symbol={symbol} />}
      </TabsContent>
      
      <TabsContent value="growth" className="mt-4">
        {activeTab === "growth" && <GrowthTabContent financials={financials} symbol={symbol} />}
      </TabsContent>
    </Tabs>
  );
};

export default AnalysisTabs;
