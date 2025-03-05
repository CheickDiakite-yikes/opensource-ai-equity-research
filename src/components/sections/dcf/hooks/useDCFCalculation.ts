
import { useState, useCallback } from "react";
import { useCustomDCF } from "@/hooks/dcf/useCustomDCF";
import { convertAssumptionsToParams } from "../utils/dcfDataUtils";
import { toast } from "@/components/ui/use-toast";
import { AIDCFSuggestion } from "@/types/ai-analysis/dcfTypes";

export const useDCFCalculation = (symbol: string) => {
  const [usingMockData, setUsingMockData] = useState(false);
  
  const { 
    calculateCustomDCF, 
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
      const result = await calculateCustomDCF(params);
      
      // Handle null result
      if (result === null) {
        console.warn("DCF calculation returned null result");
        return { success: false };
      }
      
      // First, check if result exists
      if (!result) {
        console.warn("No result returned from DCF calculation");
        return { success: false };
      }
      
      // Then check if it's an object with 'success' property
      if (typeof result === 'object' && result !== null) {
        if ('success' in result) {
          return result;
        }
        
        // If result exists and is an object but doesn't have success property,
        // wrap it in a success object
        return { success: true };
      }
      
      // If result is not an object, return a failure object
      return { success: false };
    } catch (err) {
      console.error("Error calculating DCF with AI assumptions:", err);
      setUsingMockData(true);
      
      toast({
        title: "Using Estimated DCF",
        description: "We couldn't calculate an exact DCF with AI assumptions. Using estimated values instead.",
        variant: "default",
      });
      
      return { success: false, error: err };
    }
  }, [symbol, calculateCustomDCF]);

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
