import { useState } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { usePredictionGenerator } from "./usePredictionGenerator";

// This is a wrapper around usePredictionGenerator that adds the extra properties
// needed by components using this hook
export const useStockPrediction = (symbol: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isPredicting, prediction, handlePredictPrice } = usePredictionGenerator(symbol);

  const generatePrediction = async (params: { symbol: string; quickMode: boolean }) => {
    // This is a wrapper function that provides compatibility with the existing code
    setIsLoading(true);
    setError(null);
    
    try {
      // We're ignoring the quickMode parameter here since it's not used in the implementation
      // but we keep it for compatibility
      return await handlePredictPrice(
        params.symbol,
        params.symbol, // Using symbol as a fallback for companyName
        {}, // Empty profile object, will be populated in the handlePredictPrice function
        {}, // Empty financials object, will be populated in the handlePredictPrice function
        [] // Empty news array
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPredicting,
    prediction,
    error,
    setError,
    generatePrediction,
    handlePredictPrice
  };
};

// Re-export the original hook for direct usage
export { usePredictionGenerator } from "./usePredictionGenerator";
