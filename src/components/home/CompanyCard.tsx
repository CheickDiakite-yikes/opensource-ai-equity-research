
import React from "react";
import { TrendingUp, TrendingDown, ExternalLink, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fetchStockQuote, fetchStockRating } from "@/services/api/profileService";
import { useQuery } from "@tanstack/react-query";

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
  const { data: quote } = useQuery({
    queryKey: ['stockQuote', company.symbol],
    queryFn: () => fetchStockQuote(company.symbol),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: ratingData } = useQuery({
    queryKey: ['stockRating', company.symbol],
    queryFn: () => fetchStockRating(company.symbol),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const predictedPrice = quote?.price 
    ? (quote.price * (1 + (Math.sin(company.symbol.charCodeAt(0)) * 0.25))).toFixed(2)
    : null;

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
              {quote && (
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Price</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="font-bold text-lg">{quote.price.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {predictedPrice && (
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Prediction</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-indigo-500 mr-1" />
                    <span className="font-bold text-lg">{predictedPrice}</span>
                  </div>
                </div>
              )}
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
              
              {ratingData && (
                <div className="px-2.5 py-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-sm font-medium">
                  {ratingData.rating || "Hold"}
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
