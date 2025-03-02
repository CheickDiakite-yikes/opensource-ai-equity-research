import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockOverview from "@/components/StockOverview";
import FinancialHighlights from "@/components/sections/FinancialHighlights";
import IncomeStatementTable from "@/components/tables/IncomeStatementTable";
import BalanceSheetTable from "@/components/tables/BalanceSheetTable";
import CashFlowStatementTable from "@/components/tables/CashFlowStatementTable";
import KeyRatiosTable from "@/components/tables/KeyRatiosTable";
import GrowthTabContent from "@/components/sections/GrowthTabContent";
import ValuationTabContent from "@/components/sections/ValuationTabContent";
import { useStockData } from "@/components/stocks/useStockData";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis: React.FC<StockAnalysisProps> = ({ symbol }) => {
  const { 
    data, 
    isLoading, 
    error 
  } = useStockData(symbol);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return <p>No data available.</p>;
  }

  const { 
    profile, 
    quote, 
    incomeStatements, 
    balanceSheets, 
    cashFlowStatements, 
    keyRatios 
  } = data;

  return (
    <div className="space-y-4">
      <FinancialHighlights 
        profile={profile} 
        quote={quote} 
        incomeStatements={incomeStatements} 
        balanceSheets={balanceSheets} 
        cashFlowStatements={cashFlowStatements} 
        keyRatios={keyRatios} 
      />
      
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="bg-secondary rounded-md p-1">
          <TabsTrigger value="income">Income Stmt</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ratios">Key Ratios</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income" className="animate-fade-in">
          <IncomeStatementTable incomeStatements={incomeStatements} />
        </TabsContent>
        
        <TabsContent value="balance" className="animate-fade-in">
          <BalanceSheetTable balanceSheets={balanceSheets} />
        </TabsContent>
        
        <TabsContent value="cashflow" className="animate-fade-in">
          <CashFlowStatementTable cashFlowStatements={cashFlowStatements} />
        </TabsContent>
        
        <TabsContent value="ratios" className="animate-fade-in">
          <KeyRatiosTable keyRatios={keyRatios} />
        </TabsContent>

        <TabsContent value="growth" className="animate-fade-in">
          <GrowthTabContent 
            financials={incomeStatements} 
            symbol={symbol}
            transcripts={data.transcripts}
            filings={data.filings}
          />
        </TabsContent>

        <TabsContent value="valuation" className="animate-fade-in">
          <ValuationTabContent 
            profile={profile}
            quote={quote}
            incomeStatements={incomeStatements}
            balanceSheets={balanceSheets}
            cashFlowStatements={cashFlowStatements}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockAnalysis;
