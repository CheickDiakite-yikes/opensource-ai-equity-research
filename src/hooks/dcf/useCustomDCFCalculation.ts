
import { useState } from "react";
import { fetchCustomDCF, fetchCustomLeveredDCF, DCFType } from "@/services/api/analysis/dcfService";
import { CustomDCFParams, CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { createProjectedData, handleDCFError } from "./dcfCalculationUtils";
import { useStandardDCF } from "./useStandardDCF";

export const useCustomDCFCalculation = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CustomDCFResult | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Import standard DCF for fallback
  const { calculateStandardDCF } = useStandardDCF(symbol);

  const calculateCustomDCF = async (params: CustomDCFParams, type: DCFType = DCFType.CUSTOM_ADVANCED) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      // Add the symbol to the params if not already included
      const paramsWithSymbol = { ...params, symbol };
      
      console.log(`Sending ${type} DCF calculation request with parameters:`, paramsWithSymbol);
      
      let apiResult;
      try {
        if (type === DCFType.CUSTOM_LEVERED) {
          apiResult = await fetchCustomLeveredDCF(symbol, paramsWithSymbol);
        } else {
          apiResult = await fetchCustomDCF(symbol, paramsWithSymbol, type);
        }
      } catch (err) {
        console.error(`Error with ${type} DCF, trying standard DCF as fallback:`, err);
        // If custom DCF fails, try standard DCF
        return await calculateStandardDCF();
      }
      
      if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
        console.log(`Received ${type} DCF results:`, apiResult);
        
        // The API returns an array, but we'll use the first item as our primary result
        const dcfResult = apiResult[0];
        
        // Populate projected data with yearly values
        const yearly = createProjectedData(apiResult, params);
        
        setResult(dcfResult);
        setProjectedData(yearly);
        
        return { dcfResult, yearly };
      } else {
        console.error(`Invalid or empty result from ${type} DCF:`, apiResult);
        setError(`Failed to calculate ${type} DCF. Please check the parameters and try again.`);
        
        // If custom DCF fails due to empty results, try standard DCF
        return await handleDCFError(
          new Error(`Empty or invalid ${type} DCF result`),
          calculateStandardDCF,
          `calculating ${type} DCF`
        );
      }
    } catch (err) {
      setError(`An error occurred during calculation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // If custom DCF fails with error, try standard DCF as fallback
      return await handleDCFError(
        err,
        calculateStandardDCF,
        `calculating custom ${type} DCF`
      );
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateCustomDCF,
    result,
    projectedData,
    isCalculating,
    error
  };
};
