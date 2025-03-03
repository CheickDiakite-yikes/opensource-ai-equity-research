
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  fetchIncomeStatements, 
  fetchBalanceSheets, 
  fetchKeyRatios,
  fetchCashFlowStatements,
  withRetry
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
import ErrorDisplay from "@/components/reports/ErrorDisplay";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis = ({ symbol }: StockAnalysisProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  // We'll use the useResearchReportData hook to get all financial data
  const { 
    isLoading, 
    data, 
    error, 
    dataLoadingStatus
  } = useResearchReportData(symbol);
  
  // If at least 2 of these 3 core financial statements are available, we'll consider
  // we have enough data to show the analysis tab
  const hasMinimumFinancialData = (
    (data.income.length > 0 ? 1 : 0) + 
    (data.balance.length > 0 ? 1 : 0) + 
    (data.cashflow.length > 0 ? 1 : 0)
  ) >= 2;

  // Check if there are any errors in loading specific data types
  const errorStatuses = Object.entries(dataLoadingStatus).filter(
    ([_, status]) => status === 'error'
  );
  
  // This will fetch missing financial data directly if needed
  const [directFinancials, setDirectFinancials] = useState({
    income: data.income,
    balance: data.balance,
    cashflow: data.cashflow,
    ratios: data.ratios
  });
  
  // Try to fetch missing data directly when needed
  useEffect(() => {
    const fetchMissingData = async () => {
      // First, check if we need to fetch any missing data
      if (!isLoading && !error && !hasMinimumFinancialData) {
        console.log("Attempting to fetch missing financial data directly for", symbol);
        
        try {
          // Start with data from useResearchReportData
          const newFinancials = { ...directFinancials };
          let dataImproved = false;
          
          // Try to fetch income statements if missing
          if (data.income.length === 0) {
            try {
              console.log(`Fetching income statements for ${symbol}...`);
              const incomeData = await withRetry(() => fetchIncomeStatements(symbol), 2);
              if (incomeData && incomeData.length > 0) {
                newFinancials.income = incomeData;
                dataImproved = true;
                console.log(`Retrieved ${incomeData.length} income statements directly`);
              }
            } catch (err) {
              console.error("Error fetching income statements:", err);
            }
          }
          
          // Try to fetch balance sheets if missing
          if (data.balance.length === 0) {
            try {
              console.log(`Fetching balance sheets for ${symbol}...`);
              const balanceData = await withRetry(() => fetchBalanceSheets(symbol), 2);
              if (balanceData && balanceData.length > 0) {
                newFinancials.balance = balanceData;
                dataImproved = true;
                console.log(`Retrieved ${balanceData.length} balance sheets directly`);
              }
            } catch (err) {
              console.error("Error fetching balance sheets:", err);
            }
          }
          
          // Try to fetch cash flow statements if missing
          if (data.cashflow.length === 0) {
            try {
              console.log(`Fetching cash flow statements for ${symbol}...`);
              const cashflowData = await withRetry(() => fetchCashFlowStatements(symbol), 2);
              if (cashflowData && cashflowData.length > 0) {
                newFinancials.cashflow = cashflowData;
                dataImproved = true;
                console.log(`Retrieved ${cashflowData.length} cash flow statements directly`);
              }
            } catch (err) {
              console.error("Error fetching cash flow statements:", err);
            }
          }
          
          // Try to fetch ratios if missing
          if (data.ratios.length === 0) {
            try {
              console.log(`Fetching key ratios for ${symbol}...`);
              const ratiosData = await withRetry(() => fetchKeyRatios(symbol), 2);
              if (ratiosData && ratiosData.length > 0) {
                newFinancials.ratios = ratiosData;
                dataImproved = true;
                console.log(`Retrieved ${ratiosData.length} financial ratios directly`);
              }
            } catch (err) {
              console.error("Error fetching key ratios:", err);
            }
          }
          
          // Update state if we improved the data
          if (dataImproved) {
            setDirectFinancials(newFinancials);
            toast.success("Retrieved additional financial data");
          } else {
            toast.error(`Could not retrieve financial data for ${symbol}`);
          }
        } catch (err) {
          console.error("Error fetching missing financial data:", err);
          toast.error(`Failed to retrieve financial data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    };
    
    fetchMissingData();
  }, [symbol, isLoading, error, data, hasMinimumFinancialData]);
  
  // Combine data from both sources (useResearchReportData and direct fetch)
  const combinedData = {
    income: data.income.length > 0 ? data.income : directFinancials.income,
    balance: data.balance.length > 0 ? data.balance : directFinancials.balance,
    cashflow: data.cashflow.length > 0 ? data.cashflow : directFinancials.cashflow,
    ratios: data.ratios.length > 0 ? data.ratios : directFinancials.ratios,
    transcripts: data.transcripts,
    filings: data.filings
  };
  
  // Check if combined data has minimum requirements
  const hasCombinedMinimumData = (
    (combinedData.income.length > 0 ? 1 : 0) + 
    (combinedData.balance.length > 0 ? 1 : 0) + 
    (combinedData.cashflow.length > 0 ? 1 : 0)
  ) >= 2;

  // Function to retry fetching data
  const handleRetry = async () => {
    setIsRetrying(true);
    toast.info(`Attempting to fetch financial data for ${symbol}...`);
    
    try {
      // Directly fetch all financial statements with higher retry counts
      const [income, balance, cashflow, ratios] = await Promise.all([
        withRetry(() => fetchIncomeStatements(symbol), 3),
        withRetry(() => fetchBalanceSheets(symbol), 3),
        withRetry(() => fetchCashFlowStatements(symbol), 3),
        withRetry(() => fetchKeyRatios(symbol), 3)
      ]);
      
      // Update the direct financials state
      setDirectFinancials({
        income,
        balance,
        cashflow,
        ratios
      });
      
      // Check if we got enough data
      const gotEnoughData = (
        (income.length > 0 ? 1 : 0) + 
        (balance.length > 0 ? 1 : 0) + 
        (cashflow.length > 0 ? 1 : 0)
      ) >= 2;
      
      if (gotEnoughData) {
        toast.success(`Successfully retrieved financial data for ${symbol}`);
      } else {
        toast.error(`Could not retrieve enough financial data for ${symbol}`);
      }
    } catch (err) {
      console.error("Error in retry operation:", err);
      toast.error(`Retry failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading || isRetrying) {
    return <LoadingSkeleton />;
  }

  // If there's still not enough data after both attempts, show error
  if (error || !hasCombinedMinimumData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium text-red-600 mb-4">No Financial Data Available</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't load the financial data required for analysis. This may be due to:
          </p>
          <ul className="text-sm text-muted-foreground bg-muted p-4 rounded-md mb-6 mx-auto max-w-lg text-left">
            <li className="mb-2">• Data provider API limitations or rate limiting</li>
            <li className="mb-2">• The selected company ({symbol}) may not have public financial data</li>
            <li className="mb-2">• Temporary connectivity issues with our data sources</li>
            <li>• The financial data for this company may be in a different format</li>
          </ul>
          <Button 
            onClick={handleRetry} 
            className="mt-2 flex items-center gap-2"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
          </Button>
        </div>
      </Card>
    );
  }

  // Prepare financial data from combined data
  const financials = prepareFinancialData(
    combinedData.income, 
    combinedData.balance, 
    combinedData.cashflow
  );
  const ratioData = prepareRatioData(combinedData.ratios);

  // Generate empty mock data for any missing statement type
  if (combinedData.income.length === 0 || combinedData.balance.length === 0 || combinedData.cashflow.length === 0) {
    toast.info(`Some financial statements are missing for ${symbol}. Analysis may be limited.`, {
      duration: 5000,
      id: "missing-data-warning" // Prevent duplicate toasts
    });
  }

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
            transcripts={combinedData.transcripts}
            filings={combinedData.filings}
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
