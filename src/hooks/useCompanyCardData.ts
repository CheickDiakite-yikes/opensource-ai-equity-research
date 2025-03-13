
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStockQuote, fetchStockRating } from "@/services/api/profileService";
import { useStockPrediction } from "@/hooks/stock-prediction";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";

/**
 * Custom hook to fetch and manage data for company cards
 */
export const useCompanyCardData = (symbol: string) => {
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  
  // Fetch stock quote data
  const { 
    data: quote,
    isLoading: isQuoteLoading,
    error: quoteError
  } = useQuery({
    queryKey: ['stockQuote', symbol],
    queryFn: () => fetchStockQuote(symbol),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stock rating data
  const { 
    data: ratingData,
    isLoading: isRatingLoading,
    error: ratingError
  } = useQuery({
    queryKey: ['stockRating', symbol],
    queryFn: () => fetchStockRating(symbol),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  
  // Use our stock prediction hook
  const { 
    isPredicting,
    prediction,
    error: predictionError,
    generatePrediction
  } = useStockPrediction(symbol);

  useEffect(() => {
    // Generate prediction when quote data is available
    if (quote && !prediction && !isPredicting && !predictionError) {
      const fetchPrediction = async () => {
        try {
          await generatePrediction({ 
            symbol,
            quickMode: true 
          });
        } catch (err) {
          console.error("Error generating prediction:", err);
        }
      };
      
      fetchPrediction();
    }
  }, [quote, prediction, isPredicting, predictionError, symbol, generatePrediction]);

  useEffect(() => {
    // Set the predicted price when prediction is available
    if (prediction) {
      setPredictedPrice(prediction.predictedPrice.oneMonth);
    } else if (quote) {
      // Fallback calculation if no AI prediction is available
      // This is a simple placeholder calculation
      const randomFactor = Math.sin(symbol.charCodeAt(0) * 0.01) * 0.25;
      setPredictedPrice(quote.price * (1 + randomFactor));
    }
  }, [prediction, quote, symbol]);

  return {
    quote,
    ratingData,
    predictedPrice,
    isLoading: isQuoteLoading || isRatingLoading,
    isPredicting,
    prediction,
    error: quoteError || ratingError || predictionError
  };
};
