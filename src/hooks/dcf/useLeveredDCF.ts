
import { useState } from "react";
import { fetchLeveredDCF } from "@/services/api/analysis/dcf/standardDCFService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { createProjectedData } from "./dcfCalculationUtils";
import { useStandardDCF } from "./useStandardDCF";
import { toast } from "@/components/ui/use-toast";

export const useLeveredDCF = (symbol: string) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CustomDCFResult | null>(null);
  const [projectedData, setProjectedData] = useState<YearlyDCFData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Import standard DCF for fallback
  const { calculateStandardDCF } = useStandardDCF(symbol);

  const calculateLeveredDCF = async (limit?: number) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      console.log(`useLeveredDCF - Starting calculation for ${symbol}`);
      
      const apiResult = await fetchLeveredDCF(symbol, limit || 10);
      
      // Store the raw API response for debugging
      setRawResponse(apiResult);
      console.log(`useLeveredDCF - Raw API response for ${symbol}:`, apiResult);
      
      if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
        // Check if using mock data
        const isMockData = apiResult[0].mockData === true;
        console.log(`useLeveredDCF - Is using mock data? ${isMockData}`);
        
        // Use the first item as our main DCF result
        const dcfResult = apiResult[0];
        
        if (isMockData) {
          console.warn(`useLeveredDCF - Using mock DCF data for ${symbol}`);
          toast({
            title: "Using Estimated DCF Values",
            description: "We're displaying estimated values. Real API data unavailable.",
            variant: "default",
          });
        } else {
          toast({
            title: "Levered DCF Calculation Complete",
            description: `Intrinsic value per share: $${dcfResult.equityValuePerShare.toFixed(2)}`,
          });
        }
        
        setResult(dcfResult);
        
        // Create projected data from the API result
        const yearly = createProjectedData(apiResult);
        setProjectedData(yearly);
        
        return { dcfResult, yearly };
      } else {
        console.error("useLeveredDCF - Invalid or empty result:", apiResult);
        setError("Failed to calculate levered DCF. Using standard DCF instead.");
        
        toast({
          title: "Levered DCF Calculation Failed",
          description: "Failed to calculate levered DCF. Using standard DCF instead.",
          variant: "destructive",
        });
        
        // Fallback to standard DCF if levered fails
        return await calculateStandardDCF();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`useLeveredDCF - Error during calculation: ${errorMessage}`);
      setError(`An error occurred during calculation: ${errorMessage}`);
      
      toast({
        title: "Levered DCF Calculation Failed",
        description: "Using standard DCF as fallback.",
        variant: "destructive",
      });
      
      // Fallback to standard DCF if levered fails
      return await calculateStandardDCF();
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateLeveredDCF,
    result,
    projectedData,
    isCalculating,
    error,
    rawResponse
  };
};
