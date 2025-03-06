
import { useState } from "react";
import { fetchLeveredDCF } from "@/services/api/analysis/dcfService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { createProjectedData, createDefaultDCFResult, handleDCFError } from "./dcfCalculationUtils";
import { useStandardDCF } from "./useStandardDCF";

export const useLeveredDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CustomDCFResult | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Import standard DCF for fallback
  const { calculateStandardDCF } = useStandardDCF(symbol);

  const calculateLeveredDCF = async (limit?: number) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      console.log("Fetching levered DCF for", symbol);
      
      const apiResult = await fetchLeveredDCF(symbol, limit || 10);
      
      if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
        console.log("Received levered DCF results:", apiResult);
        
        // Transform the data for our UI
        const dcfResult = createDefaultDCFResult(symbol, apiResult);
        
        setResult(dcfResult);
        
        // Create projected data
        const yearly = createProjectedData(apiResult);
        setProjectedData(yearly);
        
        return { dcfResult, yearly };
      } else {
        console.error("Invalid or empty result from levered DCF:", apiResult);
        setError("Failed to calculate levered DCF. Please try again later.");
        
        // Fallback to standard DCF if levered fails
        return await handleDCFError(
          new Error("Empty or invalid levered DCF result"), 
          calculateStandardDCF,
          "calculating levered DCF"
        );
      }
    } catch (err) {
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to standard DCF if levered fails
      return await handleDCFError(
        err, 
        calculateStandardDCF,
        "calculating levered DCF"
      );
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateLeveredDCF,
    result,
    projectedData,
    isCalculating,
    error
  };
};
