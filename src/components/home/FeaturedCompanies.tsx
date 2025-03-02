
import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        Featured Companies
      </h3>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {featuredSymbols.map((item) => (
          <Card 
            key={item.symbol}
            className="cursor-pointer hover:border-primary/50 transition-all duration-200"
            onClick={() => onSelectSymbol(item.symbol)}
          >
            <CardContent className="p-4 text-center">
              <div className="font-bold text-lg">{item.symbol}</div>
              <div className="text-sm text-muted-foreground">{item.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default FeaturedCompanies;
