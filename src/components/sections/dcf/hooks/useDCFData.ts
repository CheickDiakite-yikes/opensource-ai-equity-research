
import { useState, useEffect, useCallback } from "react";
import { useDCFAssumptions } from "./useDCFAssumptions";
import { useDCFCalculation } from "./useDCFCalculation";
import { useDCFErrors } from "./useDCFErrors";
import { getCurrentPrice } from "../utils/priceUtils";
import { createMockDCFData, prepareDCFData } from "../utils/dcfDataUtils";
import { FormattedDCFData } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";

export const useDCFData = (symbol: string, financials: any[]) => {
  // Get the current price
  const currentPrice = getCurrentPrice(financials);
  
  // State for tracking tab changes
  const [activeTab, setActiveTab] = useState("automatic");
  
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
    dcfResult,
    projectedData,
    isLoading: isCalculating,
    error: dcfError,
    usingMockData,
    setUsingMockData,
    calculateDCFWithAIAssumptions
  } = useDCFCalculation(symbol);
  
  const { errors, addError } = useDCFErrors(assumptionsError, dcfError);
  
  // Mock DCF data as fallback
  const mockDCFData = createMockDCFData(financials);

  // When assumptions change or on initial load, fetch DCF data
  useEffect(() => {
    if (symbol && !hasAttemptedFetch && assumptions) {
      console.log("Calculating DCF with AI assumptions:", assumptions);
      toast({
        title: "Calculating DCF",
        description: "Using AI-generated assumptions to calculate intrinsic value",
      });
      
      try {
        calculateDCFWithAIAssumptions(assumptions, financials);
      } catch (err) {
        console.error("Error initiating DCF calculation:", err);
        
        // Explicitly handle potential API not found errors
        if (err instanceof Error && err.message.includes("404")) {
          addError(new Error("DCF API endpoint not found. The service may not be deployed or configured correctly."));
        } else if (err instanceof Error) {
          addError(new Error(`Error initiating DCF calculation: ${err.message}`));
        } else {
          addError(new Error(`Error initiating DCF calculation: ${String(err)}`));
        }
      }
      
      setHasAttemptedFetch(true);
    }
  }, [symbol, assumptions, hasAttemptedFetch, calculateDCFWithAIAssumptions, financials, setHasAttemptedFetch, addError]);

  // Handle switching to custom DCF tab
  const handleSwitchToCustomDCF = useCallback(() => {
    setActiveTab("custom");
    // You would typically propagate this tab change to a parent component
  }, []);

  // Handle refreshing assumptions and recalculating DCF
  const handleRefreshDCF = useCallback(async () => {
    try {
      toast({
        title: "Refreshing DCF Analysis",
        description: "Fetching new AI-generated assumptions...",
      });
      
      const result = await handleRefreshAssumptions();
      
      if (result.success) {
        // Wait for assumptions to update before recalculating
        setTimeout(() => {
          if (assumptions) {
            toast({
              title: "Recalculating DCF",
              description: "Using fresh AI-generated assumptions",
            });
            calculateDCFWithAIAssumptions(assumptions, financials);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error in refresh DCF flow:", err);
      setUsingMockData(true);
      if (err instanceof Error) {
        addError(new Error(`Error refreshing DCF: ${err.message}`));
      } else {
        addError(new Error(`Error refreshing DCF: ${String(err)}`));
      }
    }
  }, [handleRefreshAssumptions, assumptions, calculateDCFWithAIAssumptions, financials, setUsingMockData, addError]);

  // Determine whether to use mock data
  const shouldUseMockData = 
    isCalculating || 
    (dcfError && !dcfResult) || 
    !dcfResult || 
    usingMockData;

  // Determine which data to use (real or mock)
  const dcfData: FormattedDCFData = shouldUseMockData
    ? mockDCFData
    : prepareDCFData(dcfResult, assumptions, projectedData, mockDCFData.sensitivity);

  return {
    dcfData,
    currentPrice,
    isCalculating,
    isLoadingAssumptions,
    errors,
    assumptions,
    usingMockData: shouldUseMockData,
    handleRefreshAssumptions: handleRefreshDCF,
    handleSwitchToCustomDCF,
    activeTab,
    setActiveTab
  };
};
