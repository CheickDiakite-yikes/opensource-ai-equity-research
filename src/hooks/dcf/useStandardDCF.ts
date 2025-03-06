
import { useState } from "react";
import { fetchStandardDCF } from "@/services/api/analysis/dcf/standardDCFService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { toast } from "@/components/ui/use-toast";
import { createProjectedData } from "./dcfCalculationUtils";

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
        
        // Use the first result as our DCF result
        const dcfResult = apiResult[0];
        
        setResult(dcfResult);
        
        // Create projected data from the array of yearly data
        const yearly = createProjectedData(apiResult);
        setProjectedData(yearly);
        
        console.log("Created projected data:", yearly);
        
        toast({
          title: "DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare.toFixed(2)}`,
        });
        
        return { dcfResult, yearly };
      } else {
        console.error("Invalid or empty result from standard DCF:", apiResult);
        setError("Failed to calculate standard DCF. Please try again later.");
        
        toast({
          title: "DCF Calculation Failed",
          description: "Failed to calculate the DCF value. Using estimated values.",
          variant: "destructive",
        });
        
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error calculating standard DCF:", errorMessage);
      setError(`An error occurred during calculation: ${errorMessage}`);
      
      toast({
        title: "DCF Calculation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
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
