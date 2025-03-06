
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
        
        // Use the first item as our main DCF result
        const dcfResult = apiResult[0];
        
        setResult(dcfResult);
        
        // Create projected data
        const yearly = createProjectedData(apiResult);
        setProjectedData(yearly);
        
        toast({
          title: "Levered DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare.toFixed(2)}`,
        });
        
        return { dcfResult, yearly };
      } else {
        console.error("Invalid or empty result from levered DCF:", apiResult);
        setError("Failed to calculate levered DCF. Please try again later.");
        
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
    error
  };
};
