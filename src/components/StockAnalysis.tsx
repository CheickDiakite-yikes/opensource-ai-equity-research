
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchKeyRatios,
  fetchCashFlowStatements
} from "@/services/api";
import type { IncomeStatement, BalanceSheet, KeyRatio, CashFlowStatement } from "@/types";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import FinancialsTabContent from "@/components/sections/FinancialsTabContent";
import BalanceSheetTabContent from "@/components/sections/BalanceSheetTabContent";
import CashFlowTabContent from "@/components/sections/CashFlowTabContent";
import RatiosTabContent from "@/components/sections/RatiosTabContent";
import GrowthTabContent from "@/components/sections/GrowthTabContent";
import DCFTabContent from "@/components/sections/DCFTabContent";
import { prepareFinancialData, prepareRatioData } from "@/utils/financialDataUtils";
import { useResearchReportData } from "@/components/reports/useResearchReportData";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis = ({ symbol }: StockAnalysisProps) => {
  // We'll use the useResearchReportData hook to get transcripts and filings
  const { 
    isLoading, 
    data, 
    error, 
    hasFinancialData 
  } = useResearchReportData(symbol);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !hasFinancialData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Financial Data</h3>
          <p className="text-muted-foreground">{error || `No financial data available for ${symbol}`}</p>
        </div>
      </Card>
    );
  }

  // Extract data from the useResearchReportData hook
  const financials = prepareFinancialData(data.income, data.balance, data.cashflow);
  const ratioData = prepareRatioData(data.ratios);

  return (
    <div className="space-y-6">
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
            transcripts={data.transcripts}
            filings={data.filings}
          />
        </TabsContent>
        
        <TabsContent value="dcf">
          <DCFTabContent financials={financials} symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockAnalysis;
