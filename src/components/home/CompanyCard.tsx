
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCompanyCardData } from "@/hooks/useCompanyCardData";

// Import our new components
import CompanyCardHeader from "./card-components/CompanyCardHeader";
import PriceDisplay from "./card-components/PriceDisplay";
import TrendIndicator from "./card-components/TrendIndicator";
import PredictionIndicator from "./card-components/PredictionIndicator";

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
  // Use our custom hook to fetch data
  const {
    quote,
    prediction,
    isPredictionLoading,
    isQuoteError,
    predictionError
  } = useCompanyCardData(company.symbol);

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
            <CompanyCardHeader symbol={company.symbol} name={company.name} />

            <div className="grid grid-cols-2 gap-4 mb-2">
              <PriceDisplay 
                price={quote?.price || null}
                label="Current Price"
                isLoading={!quote && !isQuoteError}
                error={isQuoteError}
                iconColor="text-blue-500"
              />
              
              <PriceDisplay 
                price={prediction?.predictedPrice?.oneYear || null}
                label="AI Prediction"
                isLoading={isPredictionLoading}
                error={!!predictionError}
                iconColor="text-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              {quote && (
                <TrendIndicator 
                  percentage={quote.changesPercentage} 
                  timeframe="24h" 
                />
              )}
              
              <PredictionIndicator 
                currentPrice={quote?.price || 0}
                predictedPrice={prediction?.predictedPrice?.oneYear || null}
                isLoading={isPredictionLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanyCard;
