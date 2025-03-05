
import { useState, useCallback } from "react";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import { convertAssumptionsToParams } from "../utils/dcfDataUtils";
import { toast } from "@/components/ui/use-toast";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";

export const useDCFCalculation = (symbol: string) => {
  const [usingMockData, setUsingMockData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    calculateCustomDCF, 
    calculateStandardDCF,
    customDCFResult, 
    projectedData, 
    isCalculating, 
    error: dcfError 
  } = useCustomDCF(symbol);

  // Calculate DCF with AI assumptions
  const calculateDCFWithAIAssumptions = useCallback(async (
    assumptions: AIDCFSuggestion | null,
    financials: any[]
  ) => {
    setUsingMockData(false);
    
    try {
      if (!assumptions) {
        console.warn("No AI assumptions available for DCF calculation, using mock data");
        setUsingMockData(true);
        return { success: false };
      }
      
      const params = convertAssumptionsToParams(assumptions, symbol, financials);
      
      console.log("Calculating DCF with AI-generated parameters:", params);
      
      // Try to calculate custom DCF first
      try {
        const result = await calculateCustomDCF(params);
        if (result && result.dcfResult) {
          return { success: true };
        }
        throw new Error("Custom DCF calculation failed to return valid results");
      } catch (customErr) {
        console.error("Error with custom DCF:", customErr);
        
        // If custom DCF fails, try standard DCF as fallback
        if (retryCount < 1) {
          setRetryCount(prev => prev + 1);
          console.log("Trying standard DCF as fallback...");
          
          const standardResult = await calculateStandardDCF();
          if (standardResult && standardResult.dcfResult) {
            return { success: true };
          }
        }
        
        // If both failed, throw error
        throw new Error("All DCF calculation methods failed");
      }
    } catch (err) {
      console.error("Error calculating DCF with AI assumptions:", err);
      setUsingMockData(true);
      
      toast({
        title: "Using Estimated DCF",
        description: "We couldn't calculate an exact DCF with the provided data. Using estimated values instead.",
        variant: "default",
      });
      
      return { success: false, error: err };
    }
  }, [symbol, calculateCustomDCF, calculateStandardDCF, retryCount]);

  return {
    customDCFResult,
    projectedData,
    isCalculating,
    dcfError,
    usingMockData,
    setUsingMockData,
    calculateDCFWithAIAssumptions
  };
};
