
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const LandingView: React.FC<LandingViewProps> = ({ 
  recentSearches, 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 my-12 relative z-10"
    >
      {/* Add floating elements for cosmic effect */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orbital-${i}`}
          className="absolute opacity-30 z-0"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: 'white',
            borderRadius: '50%',
            filter: 'blur(1px)',
            boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.5)',
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
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
