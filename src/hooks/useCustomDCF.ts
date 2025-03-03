
import { useState } from "react";
import { CustomDCFParams, CustomDCFResult } from "@/types/aiAnalysisTypes";
import { fetchCustomDCF } from "@/services/api/analysisService";

export const useCustomDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [customDCFResult, setCustomDCFResult] = useState<CustomDCFResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateCustomDCF = async (params: CustomDCFParams) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      // Add the symbol to the params
      const result = await fetchCustomDCF(symbol, params);
      
      if (result) {
        // Transform the API response into the format we need
        const transformedResult = {
          ...result,
          // The API returns yearly projections, which we can use for charts
          projectedData: result.yearlyData?.slice(0, 5) || [],
          // Set any additional properties needed by our UI
          year: new Date().getFullYear(),
          equityValuePerShare: result.equityValuePerShare || 0,
          wacc: result.wacc || 10.5,
          taxRate: result.taxRate || 21,
          revenuePercentage: result.revenuePercentage || 5,
          longTermGrowthRate: result.longTermGrowthRate || 3
        };
        
        setCustomDCFResult(transformedResult);
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
    isCalculating,
    error
  };
};
