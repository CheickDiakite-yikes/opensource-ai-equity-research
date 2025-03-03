
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
      
      const result = await fetchCustomDCF(symbol, paramsWithSymbol);
      
      if (result && Array.isArray(result) && result.length > 0) {
        // For the projected data, we'll use the first 5 years from the result
        const yearly: YearlyDCFData[] = [];
        
        // Use the first 5 items (or fewer if less are available)
        const yearsToUse = result.slice(0, 5);
        
        yearly.push(...yearsToUse.map(year => ({
          year: year.year,
          revenue: year.revenue || 0,
          ebit: year.ebit || 0,
          ebitda: year.ebitda || 0,
          freeCashFlow: year.freeCashFlow || 0,
          operatingCashFlow: year.operatingCashFlow || 0,
          capitalExpenditure: year.capitalExpenditure || 0
        })));
        
        // Use the first item in the array as our DCF result
        setCustomDCFResult(result[0]);
        setProjectedData(yearly);
      } else {
        setError("Failed to calculate DCF. Please try again.");
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
