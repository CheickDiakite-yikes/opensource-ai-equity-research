
import { useQuery } from "@tanstack/react-query";
import { fetchStockQuote, fetchStockRating } from "@/services/api/profileService";
import { useStockPrediction } from "@/hooks/useStockPrediction";
import { useState, useEffect } from "react";
import { StockQuote } from "@/types";

/**
 * Custom hook to fetch and manage all data needed for the CompanyCard component
 */
export const useCompanyCardData = (symbol: string) => {
  const [retryPredictionCount, setRetryPredictionCount] = useState(0);
  
  // Fetch stock quote data
  const { 
    data: quote, 
    isLoading: isQuoteLoading,
    isError: isQuoteError 
  } = useQuery<StockQuote | null, Error>({
    queryKey: ['stockQuote', symbol],
    queryFn: () => fetchStockQuote(symbol),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff with max 10s
    meta: {
      errorHandler: (error: Error) => {
        console.error(`Error fetching quote for ${symbol}:`, error);
      }
    }
  });

  // Fetch stock rating data
  const { 
    data: ratingData, 
    isLoading: isRatingLoading,
    isError: isRatingError 
  } = useQuery<{ rating: string } | null, Error>({
    queryKey: ['stockRating', symbol],
    queryFn: () => fetchStockRating(symbol),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff with max 10s
    meta: {
      errorHandler: (error: Error) => {
        console.warn(`Error fetching rating for ${symbol}:`, error);
      }
    }
  });
  
  // Use prediction hook with autoFetch and quickMode enabled
  const { 
    prediction, 
    isLoading: isPredictionLoading, 
    error: predictionError, 
    retry: retryPrediction 
  } = useStockPrediction(symbol, true, true);

  // Auto retry predictions with error once
  useEffect(() => {
    if (predictionError && symbol) {
      console.error(`Prediction error for ${symbol}:`, predictionError);
      
      // Only retry once to avoid infinite loops
      if (retryPredictionCount < 1) {
        setTimeout(() => {
          retryPrediction();
          setRetryPredictionCount(prev => prev + 1);
        }, 2000);
      }
    }
  }, [predictionError, symbol, retryPrediction, retryPredictionCount]);

  return {
    quote,
    ratingData,
    prediction,
    isQuoteLoading,
    isRatingLoading,
    isPredictionLoading,
    isQuoteError,
    isRatingError,
    predictionError,
    retryPrediction
  };
};
