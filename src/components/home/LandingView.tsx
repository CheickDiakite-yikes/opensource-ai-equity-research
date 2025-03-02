
import React from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import RecentSearches from "./RecentSearches";
import HowToUse from "./HowToUse";

interface LandingViewProps {
  recentSearches: string[];
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ 
  recentSearches, 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 my-12"
    >
      <HeroSection />
      <FeaturedCompanies 
        featuredSymbols={featuredSymbols} 
        onSelectSymbol={onSelectSymbol} 
      />
      <FeatureCards />
      <RecentSearches 
        recentSearches={recentSearches} 
        onSelectSymbol={onSelectSymbol} 
      />
      <HowToUse />
    </motion.div>
  );
};

export default LandingView;
