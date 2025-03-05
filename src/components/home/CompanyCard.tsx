
import React, { useEffect } from "react";
import { TrendingUp, TrendingDown, ExternalLink, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fetchStockQuote, fetchStockRating } from "@/services/api/profileService";
import { useQuery } from "@tanstack/react-query";
import { useStockPrediction } from "@/hooks/useStockPrediction";
import { toast } from "sonner";

export interface CompanyCardProps {
  company: { symbol: string, name: string };
  onSelect: (symbol: string) => void;
}

export const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    y: -5,
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2 }
  }
};

const CompanyCard = ({ company, onSelect }: CompanyCardProps) => {
  const { data: quote, isError: isQuoteError } = useQuery({
    queryKey: ['stockQuote', company.symbol],
    queryFn: () => fetchStockQuote(company.symbol),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: ratingData, isError: isRatingError } = useQuery({
    queryKey: ['stockRating', company.symbol],
    queryFn: () => fetchStockRating(company.symbol),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
  
  // Use the prediction hook with autoFetch enabled - set quick mode to true for faster predictions
  const { 
    prediction, 
    isLoading: isPredictionLoading, 
    error: predictionError, 
    retry: retryPrediction 
  } = useStockPrediction(company.symbol, true, true);

  useEffect(() => {
    if (predictionError) {
      console.error(`Prediction error for ${company.symbol}:`, predictionError);
      // Auto retry predictions with error once
      if (company.symbol) {
        setTimeout(() => {
          retryPrediction();
        }, 2000);
      }
    }
  }, [predictionError, company.symbol, retryPrediction]);

  const getTrendIndicator = (symbol: string) => {
    if (!quote) return null;
    
    const isPositive = quote.changesPercentage > 0;
    const percentChange = Math.abs(quote.changesPercentage);
    
    return {
      icon: isPositive ? 
        <TrendingUp className="h-4 w-4" /> : 
        <TrendingDown className="h-4 w-4" />,
      value: isPositive ? 
        `+${percentChange.toFixed(2)}%` : 
        `-${percentChange.toFixed(2)}%`,
      color: isPositive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
    };
  };

  const trend = quote ? getTrendIndicator(company.symbol) : null;
  
  // Get the predicted price (1 year forecast)
  const predictedPrice = prediction?.predictedPrice?.oneYear;
  
  // Calculate prediction percentage difference from current price
  const calculatePredictionDifference = () => {
    if (!quote?.price || !predictedPrice) return null;
    
    // Calculate percentage difference properly and ensure non-zero value
    const priceDiff = ((predictedPrice - quote.price) / quote.price) * 100;
    
    // Format the difference to ensure we show at least 2 decimal places 
    // and guarantee we never show exactly 0.00% even for tiny differences
    const formattedDiff = Math.abs(priceDiff) < 0.01 
      ? (priceDiff >= 0 ? "+0.01%" : "-0.01%")
      : (priceDiff >= 0 ? `+${priceDiff.toFixed(2)}%` : `${priceDiff.toFixed(2)}%`);
      
    const isPositive = priceDiff >= 0;
    
    return {
      value: formattedDiff,
      rawValue: priceDiff,
      color: isPositive ? "bg-blue-500/20 text-blue-600" : "bg-red-500/20 text-red-600"
    };
  };
  
  const predictionDiff = calculatePredictionDifference();

  return (
    <motion.div
      variants={itemAnimation}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className="h-full"
    >
      <Card 
        className="cursor-pointer h-full transition-all duration-300 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 backdrop-blur-sm overflow-hidden"
        onClick={() => onSelect(company.symbol)}
      >
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col h-full justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-2xl text-slate-800 dark:text-slate-100">
                  {company.symbol}
                </span>
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                </motion.div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate font-medium">
                {company.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              {quote ? (
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Price</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="font-bold text-lg">{quote.price.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Price</span>
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                </div>
              )}

              <div className="flex flex-col space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Prediction</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-indigo-500 mr-1" />
                  {isPredictionLoading ? (
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                  ) : predictionError ? (
                    <div className="flex items-center text-amber-500">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Error</span>
                    </div>
                  ) : predictedPrice ? (
                    <span className="font-bold text-lg">{predictedPrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-sm text-slate-500">N/A</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {trend && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${trend.color} w-fit`}>
                  {trend.icon}
                  <span className="font-semibold text-sm">
                    {trend.value}
                  </span>
                  <span className="text-xs opacity-70">24h</span>
                </div>
              )}
              
              {predictionDiff ? (
                <div 
                  className={`px-2.5 py-1.5 rounded-md ${predictionDiff.color} text-sm font-medium`}
                  title={`AI predicts a ${Math.abs(predictionDiff.rawValue).toFixed(2)}% ${predictionDiff.rawValue >= 0 ? 'increase' : 'decrease'} in 1 year`}
                >
                  {predictionDiff.value}
                </div>
              ) : (
                <div className="px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {isPredictionLoading ? "Loading..." : "N/A"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanyCard;
