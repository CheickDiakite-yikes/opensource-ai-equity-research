
import { useState, useEffect, useRef } from "react";
import { useResearchReportData } from "@/components/reports/useResearchReportData";
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
  const [dataReady, setDataReady] = useState(false);
  const mountedRef = useRef(false);
  
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
    income: data?.income || [],
    balance: data?.balance || [],
    cashflow: data?.cashflow || [],
    ratios: data?.ratios || []
  });

  // Mark component as mounted
  useEffect(() => {
    console.log(`StockAnalysis mounted for symbol: ${symbol}`);
    mountedRef.current = true;
    setComponentMounted(true);
    
    return () => {
      console.log(`StockAnalysis unmounted for symbol: ${symbol}`);
      mountedRef.current = false;
      setComponentMounted(false);
    };
  }, [symbol]);

  // Prepare data after loading is complete
  useEffect(() => {
    if (!isLoading && !isDirectFetchLoading && !isRetrying && mountedRef.current) {
      // Small timeout to ensure state updates have propagated
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setDataReady(true);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isDirectFetchLoading, isRetrying]);

  // Combine data from both sources (useResearchReportData and direct fetch)
  const combinedData = {
    income: data?.income?.length > 0 ? data.income : directFinancials.income,
    balance: data?.balance?.length > 0 ? data.balance : directFinancials.balance,
    cashflow: data?.cashflow?.length > 0 ? data.cashflow : directFinancials.cashflow,
    ratios: data?.ratios?.length > 0 ? data.ratios : directFinancials.ratios,
    transcripts: data?.transcripts || [],
    filings: data?.filings || []
  };
  
  // Check if combined data has minimum requirements
  const hasCombinedMinimumData = (
    (combinedData.income?.length > 0 ? 1 : 0) + 
    (combinedData.balance?.length > 0 ? 1 : 0) + 
    (combinedData.cashflow?.length > 0 ? 1 : 0)
  ) >= 2;

  // Function to handle retry
  const handleRetry = async () => {
    setIsRetrying(true);
    setDataReady(false);
    const success = await retryFetchingData();
    setIsRetrying(false);
    
    if (!success && mountedRef.current) {
      toast.error(`Could not retrieve financial data for ${symbol} after multiple attempts.`);
    }
  };

  // Show loading state
  if (isLoading || isRetrying || isDirectFetchLoading || !dataReady) {
    return (
      <div>
        <LoadingSkeleton />
        <div className="text-sm text-muted-foreground text-center mt-4">
          Loading financial data for {symbol}...
        </div>
      </div>
    );
  }

  // If there's still not enough data after both attempts, show error
  if (error || !hasCombinedMinimumData) {
    return <ErrorState 
      symbol={symbol} 
      onRetry={handleRetry} 
      isRetrying={isRetrying}
      message={error || `Insufficient financial data available for ${symbol}`}
    />;
  }

  // Prepare financial data from combined data
  const financials: FinancialData[] = prepareFinancialData(
    combinedData.income || [], 
    combinedData.balance || [], 
    combinedData.cashflow || []
  );
  
  // Cast to KeyRatio[] to ensure type compatibility
  const ratioData: RatioData[] = prepareRatioData(combinedData.ratios as KeyRatio[] || []);

  // Generate empty mock data for any missing statement type
  if ((!combinedData.income?.length || !combinedData.balance?.length || !combinedData.cashflow?.length) && componentMounted) {
    console.warn(`Some financial data missing for ${symbol}. Using available data.`);
    
    toast.info(`Some financial statements are missing for ${symbol}. Analysis may be limited.`, {
      duration: 5000,
      id: `missing-data-warning-${symbol}` // Prevent duplicate toasts
    });
  }

  return (
    <div className="space-y-6">
      <AnalysisTabs 
        financials={financials} 
        ratioData={ratioData} 
        symbol={symbol} 
        transcripts={combinedData.transcripts || []}
        filings={combinedData.filings || []}
      />
    </div>
  );
};

export default StockAnalysis;
