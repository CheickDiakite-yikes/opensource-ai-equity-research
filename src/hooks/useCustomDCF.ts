
import { useState } from "react";
import { CustomDCFResult, CustomDCFParams } from "@/types/aiAnalysisTypes";
import { fetchCustomDCF } from "@/services/api/analysisService";

export const useCustomDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [customDCFResult, setCustomDCFResult] = useState<CustomDCFResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateCustomDCF = async (params: CustomDCFParams) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const result = await fetchCustomDCF(symbol, params);
      
      if (result) {
        setCustomDCFResult(result);
      } else {
        setError("Failed to calculate DCF. Please try again.");
      }
    } catch (err) {
      console.error("Error calculating custom DCF:", err);
      setError("An error occurred during calculation. Please try again.");
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
