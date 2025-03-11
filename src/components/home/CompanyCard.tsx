
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCompanyCardData } from "@/hooks/useCompanyCardData";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

// Import our new components
import CompanyCardHeader from "./card-components/CompanyCardHeader";
import PriceDisplay from "./card-components/PriceDisplay";
import TrendIndicator from "./card-components/TrendIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Use our custom hook to fetch data
  const {
    quote,
    isQuoteLoading,
    isQuoteError
  } = useCompanyCardData(company.symbol);

  return (
    <motion.div
      variants={itemAnimation}
      initial="hidden"
      animate="show"
      whileHover={isMobile ? undefined : "hover"}
      className="h-full"
    >
      <Card 
        className="cursor-pointer h-full transition-all duration-300 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 backdrop-blur-sm overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl" />
        <CardContent className={`${isMobile ? 'p-3' : 'p-6'} relative`}>
          <div className="flex flex-col h-full justify-between space-y-2">
            <CompanyCardHeader symbol={company.symbol} name={company.name} />

            <div className="flex justify-between items-center gap-2">
              <PriceDisplay 
                price={quote?.price || null}
                label="Current Price"
                isLoading={isQuoteLoading}
                error={isQuoteError}
                iconColor="text-blue-500"
                className="flex-grow"
              />
              
              {quote && quote.changesPercentage !== undefined && (
                <TrendIndicator 
                  percentage={quote.changesPercentage} 
                  timeframe="24h" 
                />
              )}
            </div>

            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-blue-200 dark:border-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(company.symbol);
              }}
            >
              <FileText className="mr-1 h-3 w-3" />
              <span className="text-sm">{isMobile ? "View" : "View Research Report"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanyCard;
