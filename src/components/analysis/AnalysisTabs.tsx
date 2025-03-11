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
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnalysisTabsProps {
  symbol: string;
  financials: FinancialData[];
  ratioData: RatioData[];
  transcripts?: EarningsCall[];
  filings?: SECFiling[];
  dataSource?: 'fmp' | 'finnhub' | 'combined';
  onRetry?: () => void;
  isRetrying?: boolean;
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ 
  symbol, 
  financials, 
  ratioData, 
  transcripts = [], 
  filings = [],
  dataSource = 'combined',
  onRetry = () => {},
  isRetrying = false
}) => {
  const [activeTab, setActiveTab] = useState("financials");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTabMounted, setIsTabMounted] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isInitialized) {
      console.log(`AnalysisTabs initialized for ${symbol} with ${financials.length} financial records from ${dataSource}`);
      setIsInitialized(true);
      
      if (dataSource === 'finnhub') {
        toast.info("Using Finnhub as alternative data source", { 
          id: `finnhub-source-${symbol}`,
          duration: 3000
        });
      } else if (dataSource === 'combined') {
        toast.success("Using combined financial data sources", {
          id: `combined-sources-${symbol}`,
          duration: 3000
        });
      }
    }
    
    const timer = setTimeout(() => {
      setIsTabMounted(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      setIsTabMounted(false);
    };
  }, [isInitialized, symbol, financials.length, dataSource]);
  
  if (!isInitialized) {
    return <LoadingSkeleton />;
  }
  
  if (!financials || financials.length === 0) {
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={onRetry} 
        isRetrying={isRetrying} 
        message="No financial data available for this company"
        dataSource="all"
      />
    );
  }

  const handleTabChange = (value: string) => {
    console.log(`Changed analysis tab to: ${value}`);
    setActiveTab(value);
  };

  const hasRatiosData = ratioData && ratioData.length > 0;
  const hasFinancialsData = financials && financials.length > 0;

  return (
    <Tabs 
      defaultValue="financials" 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className="w-full"
    >
      {isMobile ? (
        <ScrollArea className="w-full pb-2">
          <TabsList className="inline-flex min-w-max mb-4 h-9">
            <TabsTrigger value="financials" className="text-xs px-3">Income</TabsTrigger>
            <TabsTrigger value="balance-sheet" className="text-xs px-3">Balance</TabsTrigger>
            <TabsTrigger value="cash-flow" className="text-xs px-3">Cash Flow</TabsTrigger>
            <TabsTrigger value="ratios" className="text-xs px-3">Ratios</TabsTrigger>
            <TabsTrigger value="growth" className="text-xs px-3">Growth</TabsTrigger>
          </TabsList>
        </ScrollArea>
      ) : (
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="financials">Income</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>
      )}
      
      {isTabMounted && (
        <>
          <TabsContent value="financials">
            {hasFinancialsData ? (
              <FinancialsTabContent financials={financials} />
            ) : (
              <ErrorState 
                symbol={symbol} 
                onRetry={onRetry} 
                isRetrying={isRetrying} 
                dataSource="primary"
              />
            )}
          </TabsContent>
          
          <TabsContent value="balance-sheet">
            {hasFinancialsData ? (
              <BalanceSheetTabContent financials={financials} />
            ) : (
              <ErrorState 
                symbol={symbol} 
                onRetry={onRetry} 
                isRetrying={isRetrying} 
                dataSource="primary"
              />
            )}
          </TabsContent>
          
          <TabsContent value="cash-flow">
            {hasFinancialsData ? (
              <CashFlowTabContent financials={financials} />
            ) : (
              <ErrorState 
                symbol={symbol} 
                onRetry={onRetry} 
                isRetrying={isRetrying} 
                dataSource="primary"
              />
            )}
          </TabsContent>
          
          <TabsContent value="ratios">
            {hasRatiosData ? (
              <RatiosTabContent ratioData={ratioData} symbol={symbol} />
            ) : (
              <ErrorState 
                symbol={symbol} 
                onRetry={onRetry} 
                isRetrying={isRetrying} 
                dataSource="primary"
              />
            )}
          </TabsContent>
          
          <TabsContent value="growth">
            {hasFinancialsData ? (
              <GrowthTabContent financials={financials} symbol={symbol} />
            ) : (
              <ErrorState 
                symbol={symbol} 
                onRetry={onRetry} 
                isRetrying={isRetrying} 
                dataSource="primary"
              />
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default AnalysisTabs;
