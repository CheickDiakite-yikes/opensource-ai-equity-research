
import { useState } from "react";
import { fetchStandardDCF } from "@/services/api/analysis/dcf/standardDCFService";
import { CustomDCFResult, YearlyDCFData } from "@/types/ai-analysis/dcfTypes";
import { createProjectedData } from "./dcfCalculationUtils";
import { toast } from "@/components/ui/use-toast";

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
        
        // Use the first item as our main DCF result
        const dcfResult = apiResult[0];
        
        // Check if we have equityValuePerShare
        if (!dcfResult.equityValuePerShare && dcfResult.dcf) {
          // If API returned dcf instead of equityValuePerShare (older API version)
          dcfResult.equityValuePerShare = dcfResult.dcf;
        }
        
        setResult(dcfResult);
        
        // Create projected data
        const yearly = createProjectedData(apiResult);
        setProjectedData(yearly);
        
        toast({
          title: "DCF Calculation Complete",
          description: `Intrinsic value per share: $${dcfResult.equityValuePerShare.toFixed(2)}`,
        });
        
        return { dcfResult, yearly };
      } else {
        console.error("Invalid or empty result from standard DCF:", apiResult);
        
        setError("Failed to calculate DCF. Using estimated values for the calculation.");
        
        toast({
          title: "DCF Calculation Failed",
          description: "Unable to retrieve DCF data from the API. Using estimated values.",
          variant: "destructive",
        });
        
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error calculating standard DCF:", errorMessage);
      
      setError(`Failed to retrieve DCF data: ${errorMessage}`);
      
      toast({
        title: "DCF Calculation Failed",
        description: "Using estimated values based on typical assumptions.",
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
