
import React from "react";
import { motion } from "framer-motion";
import CompanyCard from "./CompanyCard";
import SectionHeader from "./SectionHeader";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            description="Explore trending stocks with AI-powered analysis and in-depth financial research."
          />
          
          {featuredSymbols.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {featuredSymbols.map((company) => (
                <CompanyCard 
                  key={company.symbol}
                  company={company}
                  onSelect={onSelectSymbol}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Featured Companies</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                There are no featured companies to display at this time.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedCompanies;
