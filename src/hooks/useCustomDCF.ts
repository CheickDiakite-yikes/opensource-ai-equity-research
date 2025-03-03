
import { useState } from "react";
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/aiAnalysisTypes";
import { fetchCustomDCF } from "@/services/api/analysisService";

export const useCustomDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [customDCFResult, setCustomDCFResult] = useState<CustomDCFResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);

  const calculateCustomDCF = async (params: CustomDCFParams) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      // Add the symbol to the params if not already included
      const paramsWithSymbol = { ...params, symbol };
      
      console.log("Sending DCF calculation request with parameters:", paramsWithSymbol);
      
      const result = await fetchCustomDCF(symbol, paramsWithSymbol);
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log("Received custom DCF results:", result);
        
        // The API returns an array, but we'll use the first item as our primary result
        // Usually the first item is the furthest future projection
        const dcfResult = result[0];
        
        // For the projected data, we'll use all items in the result array
        // since they represent yearly projections
        const yearly: YearlyDCFData[] = result.map(item => ({
          year: item.year,
          revenue: item.revenue || 0,
          ebit: item.ebit || 0,
          ebitda: item.ebitda || 0,
          freeCashFlow: item.freeCashFlow || 0,
          operatingCashFlow: item.operatingCashFlow || 0,
          capitalExpenditure: item.capitalExpenditure || 0
        }));
        
        setCustomDCFResult(dcfResult);
        setProjectedData(yearly);
      } else {
        console.error("Invalid or empty result from custom DCF:", result);
        setError("Failed to calculate DCF. Please check the parameters and try again.");
      }
    } catch (err) {
      console.error("Error calculating custom DCF:", err);
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateCustomDCF,
    customDCFResult,
    projectedData,
    isCalculating,
    error
  };
};
