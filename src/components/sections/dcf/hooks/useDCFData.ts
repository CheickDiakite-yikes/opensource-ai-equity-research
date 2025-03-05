
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
    
    try {
      const params = convertAssumptionsToParams(assumptions, symbol, financials);
      
      console.log("Calculating DCF with AI-generated parameters:", params);
      await calculateCustomDCF(params);
    } catch (err) {
      console.error("Error calculating DCF with AI assumptions:", err);
      toast({
        title: "Error",
        description: "Failed to calculate DCF with AI assumptions. Trying standard DCF instead.",
        variant: "destructive",
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
      
      // If assumptions refreshed successfully, recalculate DCF
      setTimeout(() => {
        if (assumptions) {
          calculateDCFWithAIAssumptions();
        }
      }, 500);
    } catch (err) {
      console.error("Error refreshing assumptions:", err);
      toast({
        title: "Error",
        description: "Failed to refresh DCF assumptions.",
        variant: "destructive",
      });
    }
  };

  // If we're calculating or have an error, use mock data
  const useMockData = isCalculating || (dcfError && !customDCFResult) || !customDCFResult;

  // Determine which data to use (real or mock)
  const dcfData = useMockData 
    ? mockDCFData 
    : prepareDCFData(customDCFResult, assumptions, projectedData, mockDCFData.sensitivity);

  return {
    dcfData,
    currentPrice,
    isCalculating,
    isLoadingAssumptions,
    errors,
    assumptions,
    handleRefreshAssumptions
  };
};
