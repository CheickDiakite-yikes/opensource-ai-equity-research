
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialsTabContent from "@/components/sections/FinancialsTabContent";
import BalanceSheetTabContent from "@/components/sections/BalanceSheetTabContent";
import CashFlowTabContent from "@/components/sections/CashFlowTabContent";
import RatiosTabContent from "@/components/sections/RatiosTabContent";
import GrowthTabContent from "@/components/sections/GrowthTabContent";
import DCFTabContent from "@/components/sections/DCFTabContent";
import { FinancialData, RatioData } from "@/types";
import { EarningsCall, SECFiling } from "@/types";

interface AnalysisTabsProps {
  financials: FinancialData[];
  ratioData: RatioData[];
  symbol: string;
  transcripts: EarningsCall[];
  filings: SECFiling[];
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ 
  financials, 
  ratioData, 
  symbol,
  transcripts,
  filings
}) => {
  return (
    <Tabs defaultValue="income-statement" className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
        <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
        <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
        <TabsTrigger value="dcf">DCF Valuation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="income-statement">
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
        <GrowthTabContent 
          financials={financials} 
          symbol={symbol}
          transcripts={transcripts}
          filings={filings}
        />
      </TabsContent>
      
      <TabsContent value="dcf">
        <DCFTabContent financials={financials} symbol={symbol} />
      </TabsContent>
    </Tabs>
  );
};

export default AnalysisTabs;
