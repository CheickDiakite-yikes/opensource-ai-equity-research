
import { useState, useEffect, useCallback } from "react";
import { useDCFAssumptions } from "./useDCFAssumptions";
import { useDCFCalculation } from "./useDCFCalculation";
import { useDCFErrors } from "./useDCFErrors";
import { getCurrentPrice } from "../utils/priceUtils";
import { prepareMockDCFData, prepareDCFData } from "../utils/dcfDataUtils";
import { FormattedDCFData } from "@/types/ai-analysis/dcfTypes";

export const useDCFData = (symbol: string, financials: any[], quoteData?: any) => {
  // Get the current price, using quote data when available
  const currentPrice = getCurrentPrice(financials, quoteData);
  
  // Custom hooks for different concerns
  const { 
    assumptions,
    isLoadingAssumptions,
    assumptionsError,
    hasAttemptedFetch,
    setHasAttemptedFetch,
    handleRefreshAssumptions
  } = useDCFAssumptions(symbol);
  
  const {
    customDCFResult,
    projectedData,
    isCalculating,
    dcfError,
    usingMockData,
    setUsingMockData,
    calculateDCFWithAIAssumptions
  } = useDCFCalculation(symbol);
  
  const { errors } = useDCFErrors(assumptionsError, dcfError);
  
  // Mock DCF data as fallback
  const mockDCFData = prepareMockDCFData(financials, currentPrice);

  // When assumptions change or on initial load, fetch DCF data
  useEffect(() => {
    if (symbol && !hasAttemptedFetch && assumptions) {
      calculateDCFWithAIAssumptions(assumptions, financials);
      setHasAttemptedFetch(true);
    }
  }, [symbol, assumptions, hasAttemptedFetch, calculateDCFWithAIAssumptions, financials, setHasAttemptedFetch]);

  // Handle refreshing assumptions and recalculating DCF
  const handleRefreshDCF = useCallback(async () => {
    try {
      const result = await handleRefreshAssumptions();
      
      if (result.success) {
        // Wait for assumptions to update before recalculating
        setTimeout(() => {
          if (assumptions) {
            calculateDCFWithAIAssumptions(assumptions, financials);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error in refresh DCF flow:", err);
      setUsingMockData(true);
    }
  }, [handleRefreshAssumptions, assumptions, calculateDCFWithAIAssumptions, financials, setUsingMockData]);

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
    handleRefreshAssumptions: handleRefreshDCF
  };
};
