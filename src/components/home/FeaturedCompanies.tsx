import React from "react";
import { Star, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
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
    y: -5,
    scale: 1.03,
    transition: { duration: 0.2 }
  }
};

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  // Random trend indicators for demo purposes
  const getTrendIndicator = (symbol: string) => {
    // Use deterministic randomization based on symbol to keep values consistent
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isPositive = hash % 3 !== 0; // 2/3 chance of positive trend for demo
    const percentChange = ((hash % 10) + 1) / 10 * (isPositive ? 5 : 3);
    
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

  return (
    <div className="relative py-12">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 relative z-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Star className="h-7 w-7 text-blue-500" />
              <motion.div
                className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ zIndex: -1 }}
              />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Featured Companies
            </h2>
          </div>
          
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mb-8">
            Explore trending stocks and access in-depth financial analysis with just one click.
          </p>
          
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {featuredSymbols.map((company, index) => {
              const trend = getTrendIndicator(company.symbol);
              
              return (
                <motion.div
                  key={company.symbol}
                  variants={itemAnimation}
                  initial="hidden"
                  animate="show"
                  whileHover="hover"
                  custom={index}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer h-full transition-all duration-300 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-lg overflow-hidden"
                    onClick={() => onSelectSymbol(company.symbol)}
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl" />
                    <CardContent className="p-4 relative">
                      <div className="flex flex-col h-full justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xl text-slate-800 dark:text-slate-100">
                              {company.symbol}
                            </span>
                            <motion.div
                              whileHover={{ rotate: 15, scale: 1.1 }}
                              className="p-1 rounded-full bg-slate-100 dark:bg-slate-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
                            </motion.div>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 truncate font-medium">
                            {company.name}
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${trend.color} w-fit`}>
                          {trend.icon}
                          <span className="font-semibold text-sm">
                            {trend.value}
                          </span>
                          <span className="text-xs opacity-70">24h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedCompanies;
