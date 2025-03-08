
import { useState, useEffect } from "react";
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
  
  // We'll use the useResearchReportData hook to get all financial data
  const { 
    isLoading, 
    data, 
    error, 
    dataLoadingStatus
  } = useResearchReportData(symbol);
  
  // Initialize with safe fallbacks
  const safeData = {
    income: data?.income || [],
    balance: data?.balance || [],
    cashflow: data?.cashflow || [],
    ratios: data?.ratios || [],
    transcripts: data?.transcripts || [],
    filings: data?.filings || []
  };
  
  // Use the direct financial data hook to handle missing data
  const { 
    directFinancials, 
    retryFetchingData, 
    isLoading: isDirectFetchLoading 
  } = useDirectFinancialData(symbol, {
    income: safeData.income,
    balance: safeData.balance,
    cashflow: safeData.cashflow,
    ratios: safeData.ratios
  });

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
    (combinedData.income?.length > 0 ? 1 : 0) + 
    (combinedData.balance?.length > 0 ? 1 : 0) + 
    (combinedData.cashflow?.length > 0 ? 1 : 0)
  ) >= 2;

  // Function to handle retry
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const success = await retryFetchingData();
      if (!success) {
        toast.error(`Could not retrieve financial data for ${symbol} after multiple attempts.`);
      }
    } catch (error) {
      console.error("Error retrying data fetch:", error);
      toast.error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRetrying(false);
    }
  };

  // Show loading state
  if (isLoading || isRetrying || isDirectFetchLoading) {
    return <LoadingSkeleton />;
  }

  // If there's still not enough data after both attempts, show error
  if (error || !hasCombinedMinimumData) {
    console.error("Analysis error:", { error, hasCombinedMinimumData, symbol });
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={handleRetry} 
        isRetrying={isRetrying} 
        customMessage={error ? `Error loading data: ${error}` : `Insufficient financial data available for ${symbol}.`}
      />
    );
  }

  try {
    // Safely prepare financial data from combined data, handling potential undefined values
    const financials: FinancialData[] = prepareFinancialData(
      combinedData.income || [], 
      combinedData.balance || [], 
      combinedData.cashflow || []
    );
    
    // Cast to KeyRatio[] to ensure type compatibility
    const ratioData: RatioData[] = prepareRatioData(
      Array.isArray(combinedData.ratios) ? combinedData.ratios as KeyRatio[] : []
    );

    // Generate empty mock data for any missing statement type
    if ((combinedData.income?.length === 0) || 
        (combinedData.balance?.length === 0) || 
        (combinedData.cashflow?.length === 0)) {
      toast.info(`Some financial statements are missing for ${symbol}. Analysis may be limited.`, {
        duration: 5000,
        id: "missing-data-warning" // Prevent duplicate toasts
      });
    }

    // Final check to ensure we have viable financials data
    if (!financials || financials.length === 0) {
      return (
        <ErrorState 
          symbol={symbol} 
          onRetry={handleRetry} 
          isRetrying={isRetrying}
          customMessage={`No financial data available for ${symbol}. Please try another ticker.`}
        />
      );
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
  } catch (err) {
    console.error("Error preparing financial data:", err);
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={handleRetry} 
        isRetrying={isRetrying}
        customMessage={`Error processing financial data for ${symbol}: ${err instanceof Error ? err.message : 'Unknown error'}`}
      />
    );
  }
};

export default StockAnalysis;
