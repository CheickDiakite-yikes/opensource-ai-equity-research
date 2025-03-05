
import { useState, useEffect, useCallback } from "react";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import { useAIDCFAssumptions } from "@/hooks/dcf/useAIDCFAssumptions";
import { convertAssumptionsToParams, prepareMockDCFData, prepareDCFData } from "../utils/dcfDataUtils";
import { toast } from "@/components/ui/use-toast";
import { AIDCFSuggestion, YearlyDCFData, FormattedDCFData } from "@/types/ai-analysis/dcfTypes";

export const useDCFData = (symbol: string, financials: any[]) => {
  // Custom hooks
  const { 
    calculateCustomDCF, 
    customDCFResult, 
    projectedData, 
    isCalculating, 
    error: dcfError 
  } = useCustomDCF(symbol);
  
  const { 
    assumptions, 
    isLoading: isLoadingAssumptions, 
    error: assumptionsError, 
    refreshAssumptions 
  } = useAIDCFAssumptions(symbol);
  
  // State
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Get the current price from financials
  const currentPrice = getCurrentPrice(financials);
  
  // Mock DCF data as fallback
  const mockDCFData = prepareMockDCFData(financials);
  
  // Collect and display errors
  useEffect(() => {
    collectErrors(assumptionsError, dcfError, setErrors);
  }, [assumptionsError, dcfError]);

  // When assumptions change or on initial load, fetch DCF data
  useEffect(() => {
    if (symbol && !hasAttemptedFetch && assumptions) {
      calculateDCFWithAIAssumptions();
    }
  }, [symbol, assumptions, hasAttemptedFetch]);

  // Calculate DCF with AI assumptions
  const calculateDCFWithAIAssumptions = useCallback(async () => {
    setHasAttemptedFetch(true);
    setUsingMockData(false);
    
    try {
      if (!assumptions) {
        console.warn("No AI assumptions available for DCF calculation, using mock data");
        setUsingMockData(true);
        return;
      }
      
      const params = convertAssumptionsToParams(assumptions, symbol, financials);
      
      console.log("Calculating DCF with AI-generated parameters:", params);
      await calculateCustomDCF(params);
    } catch (err) {
      handleDCFCalculationError(err, setUsingMockData);
    }
  }, [assumptions, symbol, financials, calculateCustomDCF]);

  // Handle refreshing assumptions
  const handleRefreshAssumptions = useCallback(async () => {
    try {
      toast({
        title: "Refreshing",
        description: "Generating new AI-powered DCF assumptions...",
      });
      
      await refreshAssumptions();
      setHasAttemptedFetch(false);
      setUsingMockData(false);
      
      // If assumptions refreshed successfully, recalculate DCF
      setTimeout(() => {
        if (assumptions) {
          calculateDCFWithAIAssumptions();
        }
      }, 500);
    } catch (err) {
      handleRefreshError(err, setUsingMockData);
    }
  }, [refreshAssumptions, assumptions, calculateDCFWithAIAssumptions]);

  // Determine whether to use mock data
  const shouldUseMockData = 
    isCalculating || 
    (dcfError && !customDCFResult) || 
    !customDCFResult || 
    usingMockData;

  // Determine which data to use (real or mock)
  const dcfData: FormattedDCFData = shouldUseMockData
    ? mockDCFData
    : prepareDCFData(customDCFResult, assumptions, projectedData, mockDCFData.sensitivity);

  return {
    dcfData,
    currentPrice,
    isCalculating,
    isLoadingAssumptions,
    errors,
    assumptions,
    usingMockData: shouldUseMockData,
    handleRefreshAssumptions
  };
};

// Helper Functions

/**
 * Get current price from financials
 */
const getCurrentPrice = (financials: any[]): number => {
  if (!financials || financials.length === 0) return 100;
  
  try {
    return financials.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.price || 100;
  } catch (error) {
    console.error("Error getting current price:", error);
    return 100;
  }
};

/**
 * Collect errors from different sources
 */
const collectErrors = (
  assumptionsError: Error | null,
  dcfError: Error | null,
  setErrors: React.Dispatch<React.SetStateAction<string[]>>
): void => {
  const newErrors: string[] = [];
  
  if (assumptionsError) {
    newErrors.push(`AI Assumptions Error: ${assumptionsError.message || String(assumptionsError)}`);
  }
  
  if (dcfError) {
    newErrors.push(`DCF Calculation Error: ${dcfError.message || String(dcfError)}`);
  }
  
  setErrors(newErrors);
};

/**
 * Handle DCF calculation errors
 */
const handleDCFCalculationError = (
  err: any,
  setUsingMockData: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  console.error("Error calculating DCF with AI assumptions:", err);
  setUsingMockData(true);
  toast({
    title: "Using Estimated DCF",
    description: "We couldn't calculate an exact DCF with AI assumptions. Using estimated values instead.",
    variant: "default",
  });
};

/**
 * Handle refresh assumptions errors
 */
const handleRefreshError = (
  err: any,
  setUsingMockData: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  console.error("Error refreshing assumptions:", err);
  setUsingMockData(true);
  toast({
    title: "Error",
    description: "Failed to refresh DCF assumptions. Using estimated values instead.",
    variant: "destructive",
  });
};
