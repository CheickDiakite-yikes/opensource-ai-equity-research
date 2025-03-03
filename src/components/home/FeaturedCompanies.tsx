
import React from "react";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const itemAnimation = {
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
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  // Generate random trend indicators for demo purposes
  const getTrendIndicator = (index: number) => {
    // Make some positive and some negative to show variety
    const isPositive = [0, 2, 4, 5].includes(index);
    const value = (Math.random() * 5).toFixed(2);
    
    return {
      isPositive,
      value: isPositive ? `+${value}%` : `-${value}%`,
      className: isPositive ? "text-green-400" : "text-red-400"
    };
  };

  return (
    <div className="relative my-16">
      {/* Yellow curved background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 -z-10 -mx-6 sm:-mx-12 md:-mx-24 -my-8 overflow-hidden"
      >
        <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path 
            d="M0,100 C300,20 900,20 1200,100 L1200,300 L0,300 Z" 
            fill="#FFF200"
          />
        </svg>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 pt-8 relative z-10"
      >
        <div className="flex items-center gap-2 mb-8">
          <Star className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-slate-800">
            Featured Companies
          </h2>
        </div>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {featuredSymbols.map((company, index) => {
            const trend = getTrendIndicator(index);
            
            return (
              <motion.div
                key={company.symbol}
                variants={itemAnimation}
                initial="hidden"
                animate="show"
                whileHover="hover"
                className="relative"
              >
                <Card 
                  className="cursor-pointer overflow-hidden bg-slate-900 text-white border-0 shadow-lg"
                  onClick={() => onSelectSymbol(company.symbol)}
                >
                  <CardContent className="p-5 text-center">
                    <div className="font-bold text-xl mb-1 text-white">
                      {company.symbol}
                    </div>
                    <div className="text-sm text-slate-300 mb-3 truncate">
                      {company.name}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm font-medium">
                      {trend.isPositive ? 
                        <TrendingUp className="h-4 w-4 text-green-400" /> : 
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      }
                      <span className={trend.className}>
                        {trend.value}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturedCompanies;
