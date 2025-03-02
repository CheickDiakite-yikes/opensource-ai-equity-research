
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { fetchIncomeStatements, fetchBalanceSheets, fetchKeyRatios } from "@/services/api";
import type { IncomeStatement, BalanceSheet, KeyRatio } from "@/types";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import FinancialsTabContent from "@/components/sections/FinancialsTabContent";
import RatiosTabContent from "@/components/sections/RatiosTabContent";
import GrowthTabContent from "@/components/sections/GrowthTabContent";
import { prepareFinancialData, prepareRatioData } from "@/utils/financialDataUtils";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis = ({ symbol }: StockAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [income, setIncome] = useState<IncomeStatement[]>([]);
  const [balance, setBalance] = useState<BalanceSheet[]>([]);
  const [ratios, setRatios] = useState<KeyRatio[]>([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [incomeData, balanceData, ratiosData] = await Promise.all([
          fetchIncomeStatements(symbol),
          fetchBalanceSheets(symbol),
          fetchKeyRatios(symbol)
        ]);
        
        const sortedIncome = [...incomeData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const sortedBalance = [...balanceData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const sortedRatios = [...ratiosData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setIncome(sortedIncome);
        setBalance(sortedBalance);
        setRatios(sortedRatios);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchFinancialData();
    }
  }, [symbol]);

  const financials = prepareFinancialData(income, balance);
  const ratioData = prepareRatioData(ratios);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || financials.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Financial Data</h3>
          <p className="text-muted-foreground">{error || `No financial data available for ${symbol}`}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="financials" className="w-full">
        <TabsList>
          <TabsTrigger value="financials">Financial Statements</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
          <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financials">
          <FinancialsTabContent financials={financials} />
        </TabsContent>
        
        <TabsContent value="ratios">
          <RatiosTabContent ratioData={ratioData} />
        </TabsContent>
        
        <TabsContent value="growth">
          <GrowthTabContent financials={financials} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockAnalysis;
