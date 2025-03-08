
import { useState, useEffect } from "react";
import { useResearchReportData } from "@/hooks/research-report";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { prepareFinancialData, prepareRatioData } from "@/utils/financial";
import { toast } from "sonner";
import { useDirectFinancialData } from "@/hooks/useDirectFinancialData";
import ErrorState from "@/components/analysis/ErrorState";
import AnalysisTabs from "@/components/analysis/AnalysisTabs";
import { FinancialData, RatioData, KeyRatio } from "@/types";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis = ({ symbol }: StockAnalysisProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [componentMounted, setComponentMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Track component mount for proper initialization
  useEffect(() => {
    console.log(`StockAnalysis for ${symbol} - Component mounted`);
    setComponentMounted(true);
    
    return () => {
      console.log(`StockAnalysis for ${symbol} - Component unmounted`);
      setComponentMounted(false);
    };
  }, [symbol]);
  
  // We'll use the useResearchReportData hook to get all financial data
  const { 
    isLoading, 
    data, 
    error, 
    dataLoadingStatus,
    hasStockData
  } = useResearchReportData(symbol);
  
  // Use the direct financial data hook to handle missing data
  const { 
    directFinancials, 
    retryFetchingData, 
    isLoading: isDirectFetchLoading 
  } = useDirectFinancialData(symbol, {
    income: data?.income || [],
    balance: data?.balance || [],
    cashflow: data?.cashflow || [],
    ratios: data?.ratios || []
  });

  // Safely access data with fallbacks
  const safeData = {
    income: data?.income || [],
    balance: data?.balance || [],
    cashflow: data?.cashflow || [],
    ratios: data?.ratios || [],
    transcripts: data?.transcripts || [],
    filings: data?.filings || []
  };

  // Combine data from both sources (useResearchReportData and direct fetch)
  const combinedData = {
    income: safeData.income.length > 0 ? safeData.income : directFinancials.income,
    balance: safeData.balance.length > 0 ? safeData.balance : directFinancials.balance,
    cashflow: safeData.cashflow.length > 0 ? safeData.cashflow : directFinancials.cashflow,
    ratios: safeData.ratios.length > 0 ? safeData.ratios : directFinancials.ratios,
    transcripts: safeData.transcripts,
    filings: safeData.filings
  };
  
  // Check if combined data has minimum requirements
  const hasCombinedMinimumData = (
    (combinedData.income.length > 0 ? 1 : 0) + 
    (combinedData.balance.length > 0 ? 1 : 0) + 
    (combinedData.cashflow.length > 0 ? 1 : 0)
  ) >= 2;

  // Mark initial load complete after data is fetched
  useEffect(() => {
    if (!isLoading && !isDirectFetchLoading) {
      setInitialLoadComplete(true);
    }
  }, [isLoading, isDirectFetchLoading]);

  useEffect(() => {
    // Add debug logging to track data loading
    console.log(`StockAnalysis for ${symbol} - Data loading status:`, {
      income: combinedData.income.length,
      balance: combinedData.balance.length,
      cashflow: combinedData.cashflow.length,
      ratios: combinedData.ratios.length,
      hasMinimumData: hasCombinedMinimumData,
      isLoading,
      isDirectFetchLoading,
      isRetrying,
      componentMounted,
      initialLoadComplete
    });
    
    // Auto-retry if data is missing but not already retrying
    if (componentMounted && 
        initialLoadComplete && 
        !isLoading && 
        !isDirectFetchLoading && 
        !isRetrying && 
        !hasCombinedMinimumData && 
        hasStockData) {
      console.log(`StockAnalysis - Automatic retry for ${symbol}`);
      handleRetry();
    }
  }, [
    combinedData, 
    symbol, 
    hasCombinedMinimumData, 
    isLoading, 
    isDirectFetchLoading, 
    isRetrying, 
    componentMounted, 
    hasStockData,
    initialLoadComplete
  ]);

  // Function to handle retry
  const handleRetry = async () => {
    if (isRetrying) return; // Prevent multiple retries
    
    setIsRetrying(true);
    toast.info(`Fetching financial data for ${symbol}...`, {
      id: `retry-fetch-${symbol}`,
    });
    
    try {
      const success = await retryFetchingData();
      
      if (!success) {
        toast.error(`Could not retrieve financial data for ${symbol} after multiple attempts.`);
      } else {
        toast.success(`Successfully loaded data for ${symbol}`);
      }
    } catch (err) {
      console.error(`Error retrying data fetch for ${symbol}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Error loading data: ${errorMessage}`);
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading || isRetrying || isDirectFetchLoading) {
    return <LoadingSkeleton />;
  }

  // If there's still not enough data after both attempts, show error
  if (error || !hasCombinedMinimumData) {
    console.error(`Insufficient data for analysis of ${symbol}:`, error);
    return <ErrorState symbol={symbol} onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  // Prepare financial data from combined data
  const financials: FinancialData[] = prepareFinancialData(
    combinedData.income, 
    combinedData.balance, 
    combinedData.cashflow
  );
  
  // Cast to KeyRatio[] to ensure type compatibility
  const ratioData: RatioData[] = prepareRatioData(combinedData.ratios as KeyRatio[]);

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
