
import { useState, useEffect } from "react";
import { useCustomDCF } from "@/hooks/useCustomDCF";
import { useAIDCFAssumptions } from "@/hooks/useAIDCFAssumptions";
import { convertAssumptionsToParams, prepareMockDCFData, prepareDCFData } from "../utils/dcfDataUtils";
import { toast } from "@/components/ui/use-toast";

export const useDCFData = (symbol: string, financials: any[]) => {
  const { calculateCustomDCF, customDCFResult, projectedData, isCalculating, error: dcfError } = useCustomDCF(symbol);
  const { assumptions, isLoading: isLoadingAssumptions, error: assumptionsError, refreshAssumptions } = useAIDCFAssumptions(symbol);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Get the current price from financials
  const currentPrice = financials && financials.length > 0 
    ? financials.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.price || 100
    : 100;
  
  // Mock DCF data as fallback
  const mockDCFData = prepareMockDCFData(financials);
  
  // When assumptions change or on initial load, fetch DCF data
  useEffect(() => {
    if (symbol && !hasAttemptedFetch && assumptions) {
      calculateDCFWithAIAssumptions();
    }
  }, [symbol, assumptions]);

  // Collect and display errors
  useEffect(() => {
    const newErrors = [];
    
    if (assumptionsError) {
      newErrors.push(`AI Assumptions Error: ${assumptionsError}`);
    }
    
    if (dcfError) {
      newErrors.push(`DCF Calculation Error: ${dcfError}`);
    }
    
    setErrors(newErrors);
  }, [assumptionsError, dcfError]);

  const calculateDCFWithAIAssumptions = async () => {
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
      console.error("Error calculating DCF with AI assumptions:", err);
      setUsingMockData(true);
      toast({
        title: "Using Estimated DCF",
        description: "We couldn't calculate an exact DCF with AI assumptions. Using estimated values instead.",
        variant: "default",
      });
    }
  };

  const handleRefreshAssumptions = async () => {
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
      console.error("Error refreshing assumptions:", err);
      setUsingMockData(true);
      toast({
        title: "Error",
        description: "Failed to refresh DCF assumptions. Using estimated values instead.",
        variant: "destructive",
      });
    }
  };

  // Determine whether to use mock data
  // We use mock data if:
  // 1. We're still calculating, or
  // 2. There was an error and no customDCFResult, or
  // 3. There's no customDCFResult, or
  // 4. We explicitly set usingMockData to true
  const shouldUseMockData = isCalculating || (dcfError && !customDCFResult) || !customDCFResult || usingMockData;

  // Determine which data to use (real or mock)
  const dcfData = shouldUseMockData 
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
