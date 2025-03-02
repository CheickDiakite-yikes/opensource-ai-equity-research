
import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3 }
  }
};

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  // Random trend indicators for demo purposes
  const getTrendIndicator = () => {
    return Math.random() > 0.5 ? 
      { value: `+${(Math.random() * 5).toFixed(2)}%`, color: "text-green-500" } :
      { value: `-${(Math.random() * 5).toFixed(2)}%`, color: "text-red-500" };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12 pt-8"
    >
      <div className="flex items-center gap-2 mb-8">
        <Star className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">
          Featured Companies
        </h2>
      </div>
      
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {featuredSymbols.map((company, index) => {
          const trend = getTrendIndicator();
          
          return (
            <motion.div
              key={company.symbol}
              variants={itemVariant}
              initial="hidden"
              animate="show"
              whileHover="hover"
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover-card-highlight"
                onClick={() => onSelectSymbol(company.symbol)}
              >
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
                <CardContent className="p-5 text-center">
                  <div className="font-bold text-xl mb-1">
                    {company.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3 truncate">
                    {company.name}
                  </div>
                  <div className="text-sm">
                    <span className={trend.color}>
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
