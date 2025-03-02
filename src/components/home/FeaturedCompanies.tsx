
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
  show: { opacity: 1, y: 0 }
};

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  // Random trend indicators for demo purposes
  const getTrendIndicator = () => {
    return Math.random() > 0.5 ? 
      { icon: <TrendingUp className="h-4 w-4 text-green-500" />, value: `+${(Math.random() * 5).toFixed(2)}%` } :
      { icon: <TrendingDown className="h-4 w-4 text-red-500" />, value: `-${(Math.random() * 5).toFixed(2)}%` };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-5 w-5 text-yellow-500" />
        <h2 className="text-2xl font-bold">Featured Companies</h2>
      </div>
      
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {featuredSymbols.map((company, index) => {
          const trend = getTrendIndicator();
          
          return (
            <motion.div
              key={company.symbol}
              variants={itemAnimation}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="featured-card cursor-pointer overflow-hidden"
                onClick={() => onSelectSymbol(company.symbol)}
              >
                <div className="h-1 bg-gradient-to-r from-primary/80 to-primary/30" />
                <CardContent className="p-5 text-center">
                  <div className="font-bold text-xl mb-1">{company.symbol}</div>
                  <div className="text-sm text-muted-foreground mb-3 truncate">{company.name}</div>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    {trend.icon}
                    <span className={trend.value.includes('+') ? 'text-green-600' : 'text-red-600'}>
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
  );
};

export default FeaturedCompanies;
