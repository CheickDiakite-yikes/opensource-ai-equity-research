
import { useState } from "react";
import { useResearchReportData } from "@/components/reports/useResearchReportData";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { prepareFinancialData, prepareRatioData } from "@/utils/financial";
import { toast } from "sonner";
import { useDirectFinancialData } from "@/hooks/useDirectFinancialData";
import ErrorState from "@/components/analysis/ErrorState";
import AnalysisTabs from "@/components/analysis/AnalysisTabs";
import { FinancialData, RatioData } from "@/types";

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
  
  // Use the direct financial data hook to handle missing data
  const { 
    directFinancials, 
    retryFetchingData, 
    isLoading: isDirectFetchLoading 
  } = useDirectFinancialData(symbol, {
    income: data.income,
    balance: data.balance,
    cashflow: data.cashflow,
    ratios: data.ratios
  });

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

  // Function to handle retry
  const handleRetry = async () => {
    setIsRetrying(true);
    const success = await retryFetchingData();
    setIsRetrying(false);
    
    if (!success) {
      toast.error(`Could not retrieve financial data for ${symbol} after multiple attempts.`);
    }
  };

  if (isLoading || isRetrying || isDirectFetchLoading) {
    return <LoadingSkeleton />;
  }

  // If there's still not enough data after both attempts, show error
  if (error || !hasCombinedMinimumData) {
    return <ErrorState symbol={symbol} onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  // Prepare financial data from combined data
  const financials: FinancialData[] = prepareFinancialData(
    combinedData.income, 
    combinedData.balance, 
    combinedData.cashflow
  );
  const ratioData: RatioData[] = prepareRatioData(combinedData.ratios);

  // Generate empty mock data for any missing statement type
  if (combinedData.income.length === 0 || combinedData.balance.length === 0 || combinedData.cashflow.length === 0) {
    toast.info(`Some financial statements are missing for ${symbol}. Analysis may be limited.`, {
      duration: 5000,
      id: "missing-data-warning" // Prevent duplicate toasts
    });
  }

  return (
    <div className="space-y-6">
      <AnalysisTabs 
        financials={financials} 
        ratioData={ratioData} 
        symbol={symbol} 
        transcripts={combinedData.transcripts}
        filings={combinedData.filings}
      />
    </div>
  );
};

export default StockAnalysis;
