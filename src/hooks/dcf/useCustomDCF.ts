
import { useState, useEffect } from "react";
import { DCFType } from "@/services/api/analysis/dcf";
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { useStandardDCF } from "./useStandardDCF";
import { useLeveredDCF } from "./useLeveredDCF";
import { useCustomDCFCalculation } from "./useCustomDCFCalculation";

export const useCustomDCF = (symbol: string) => {
  const [customDCFResult, setCustomDCFResult] = useState<CustomDCFResult | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  
  // Import specialized DCF hooks
  const { 
    calculateStandardDCF, 
    isCalculating: isCalculatingStandard, 
    error: standardError, 
    result: standardResult,
    rawResponse: standardRawResponse
  } = useStandardDCF(symbol);
  
  const { 
    calculateLeveredDCF, 
    isCalculating: isCalculatingLevered, 
    error: leveredError, 
    result: leveredResult,
    rawResponse: leveredRawResponse
  } = useLeveredDCF(symbol);
  
  const { 
    calculateCustomDCF: calculateCustomDCFInternal, 
    isCalculating: isCalculatingCustom, 
    error: customError, 
    result: customResult,
    rawResponse: customRawResponse
  } = useCustomDCFCalculation(symbol);
  
  // Update raw API response whenever any of the hooks provide new data
  useEffect(() => {
    if (standardRawResponse) setRawApiResponse(standardRawResponse);
    else if (leveredRawResponse) setRawApiResponse(leveredRawResponse);
    else if (customRawResponse) setRawApiResponse(customRawResponse);
  }, [standardRawResponse, leveredRawResponse, customRawResponse]);
  
  // Combine calculation state from all hooks
  const isCalculating = isCalculatingStandard || isCalculatingLevered || isCalculatingCustom;
  
  // Update error state from any of the hooks
  useEffect(() => {
    const newError = standardError || leveredError || customError;
    if (newError) {
      setError(newError);
    } else {
      setError(null);
    }
  }, [standardError, leveredError, customError]);
  
  // Update results whenever any of the hooks complete their calculations
  const updateResults = (result: { dcfResult: CustomDCFResult, yearly: YearlyDCFData[] } | null) => {
    if (result) {
      setCustomDCFResult(result.dcfResult);
      setProjectedData(result.yearly);
      setError(null);
      return true;
    }
    return false;
  };
  
  // Wrapper functions to update combined state
  const calculateStandardDCFWrapper = async () => {
    const result = await calculateStandardDCF();
    return updateResults(result);
  };
  
  const calculateLeveredDCFWrapper = async (limit?: number) => {
    const result = await calculateLeveredDCF(limit);
    return updateResults(result);
  };
  
  const calculateCustomDCFWrapper = async (params: CustomDCFParams, type: DCFType = DCFType.CUSTOM_ADVANCED) => {
    const result = await calculateCustomDCFInternal(params, type);
    return updateResults(result);
  };

  return {
    calculateStandardDCF: calculateStandardDCFWrapper,
    calculateLeveredDCF: calculateLeveredDCFWrapper,
    calculateCustomDCF: calculateCustomDCFWrapper,
    customDCFResult,
    projectedData,
    isCalculating,
    error,
    rawApiResponse
  };
};
