
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
      
      // Ensure result is not null before accessing its properties
      if (result && 'success' in result) {
        return result; // Return the result if it's a valid object with success property
      }
      
      // If result doesn't contain success property or is null/undefined
      return { success: true }; // Assume success if we got here without errors
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
