
import React from "react";
import { motion } from "framer-motion";
import CompanyCard from "./CompanyCard";
import SectionHeader from "./SectionHeader";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  return (
    <div className="relative py-8">
      <div className="container mx-auto px-4 sm:px-6 md:px-0 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 relative z-10"
        >
          <SectionHeader 
            title="Featured Companies"
            description="Explore trending stocks with real-time AI price predictions and in-depth financial analysis."
          />
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {featuredSymbols.map((company) => (
              <CompanyCard 
                key={company.symbol}
                company={company}
                onSelect={onSelectSymbol}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedCompanies;
