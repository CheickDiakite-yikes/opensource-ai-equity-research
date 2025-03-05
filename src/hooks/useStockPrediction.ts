
import { useState, useEffect } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { generateStockPrediction } from "@/services/api/analysis/researchService";
import { fetchStockQuote } from "@/services/api/profileService";
import { fetchFinancialStatements } from "@/services/api/financialService";
import { fetchLatestNews } from "@/services/api/marketDataService";
import { toast } from "@/components/ui/use-toast";

export const useStockPrediction = (symbol: string, autoFetch: boolean = false, quickMode: boolean = true) => {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrediction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get required data for prediction
      const [quote, financials, news] = await Promise.all([
        fetchStockQuote(symbol),
        fetchFinancialStatements(symbol),
        fetchLatestNews(symbol, 5)
      ]);
      
      if (!quote) {
        throw new Error(`Could not fetch stock data for ${symbol}`);
      }
      
      // Generate the prediction
      const result = await generateStockPrediction(symbol, quote, financials, news, quickMode);
      setPrediction(result);
      
      return result;
    } catch (err: any) {
      console.error(`Error generating prediction for ${symbol}:`, err);
      setError(err.message || `Failed to generate prediction for ${symbol}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && symbol) {
      generatePrediction().catch(err => {
        console.error(`Auto-fetch prediction error for ${symbol}:`, err);
      });
    }
  }, [symbol, autoFetch]);

  return {
    prediction,
    isLoading,
    error,
    generatePrediction
  };
};
