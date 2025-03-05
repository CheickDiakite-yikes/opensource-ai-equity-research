
import { useState } from "react";
import { fetchStandardDCF } from "@/services/api/analysis/dcfService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { createProjectedData, createDefaultDCFResult, handleDCFError } from "./dcfCalculationUtils";

export const useStandardDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CustomDCFResult | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateStandardDCF = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      
      console.log("Fetching standard DCF for", symbol);
      
      const apiResult = await fetchStandardDCF(symbol);
      
      if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
        console.log("Received standard DCF results:", apiResult);
        
        // Transform the data for our UI
        const dcfResult = createDefaultDCFResult(symbol, apiResult);
        
        setResult(dcfResult);
        
        // Create projected data
        const yearlyData = createProjectedData(apiResult);
        setProjectedData(yearlyData);
        
        return { dcfResult, yearlyData };
      } else {
        console.error("Invalid or empty result from standard DCF:", apiResult);
        setError("Failed to calculate standard DCF. Please try again later.");
        return null;
      }
    } catch (err) {
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return await handleDCFError(err, undefined, "calculating standard DCF");
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateStandardDCF,
    result,
    projectedData,
    isCalculating,
    error
  };
};
