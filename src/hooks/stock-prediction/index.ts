
import { useState, useEffect } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { toast } from "@/components/ui/use-toast";
import { usePredictionHistory } from "./usePredictionHistory";
import { usePredictionGenerator } from "./usePredictionGenerator";
import { useRetryStrategy } from "./useRetryStrategy";
import { StockPredictionHookResult } from "./types";

/**
 * Hook to manage stock price predictions
 */
export const useStockPrediction = (
  symbol: string, 
  autoFetch: boolean = false, 
  quickMode: boolean = true
): StockPredictionHookResult => {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const { history, fetchPredictionHistory } = usePredictionHistory(symbol);
  
  const { 
    isLoading, 
    error: generatorError, 
    setError,
    generatePrediction: generatePredictionData 
  } = usePredictionGenerator({ symbol, quickMode });
  
  const performRetry = async () => {
    try {
      const result = await generateStockPrediction();
      if (result) {
        setRetryCount(0); // Reset retry count on success
      }
      return result;
    } catch (err) {
      console.error(`Retry failed for ${symbol}:`, err);
      return null;
    }
  };
  
  const { 
    retryCount, 
    setRetryCount, 
    error: retryError, 
    setError: setRetryError 
  } = useRetryStrategy({
    onRetry: performRetry,
    autoFetch
  });
  
  // Combine errors from different sources
  const error = generatorError || retryError;

  /**
   * Generate a stock prediction
   */
  const generateStockPrediction = async (): Promise<StockPrediction | null> => {
    try {
      // First fetch prediction history
      const historyData = await fetchPredictionHistory();
      
      // Generate the prediction
      const result = await generatePredictionData(historyData);
      
      if (result) {
        setPrediction(result);
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || `Failed to generate prediction for ${symbol}`);
      return null;
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && symbol) {
      generateStockPrediction().catch(err => {
        console.error(`Auto-fetch prediction error for ${symbol}:`, err);
      });
    }
  }, [symbol, autoFetch]);

  const retry = () => {
    setRetryCount(0); // Reset retry count
    return generateStockPrediction();
  };

  return {
    prediction,
    predictionHistory: history,
    isLoading,
    error,
    generatePrediction: generateStockPrediction,
    retry
  };
};

// Re-export types
export * from "./types";
