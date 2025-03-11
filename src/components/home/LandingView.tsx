
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import FeatureCards from './FeatureCards';
import FeaturedCompanies from './FeaturedCompanies';
import RecentSearches from './RecentSearches';
import FAQSection from './FAQSection';
import HowToUse from './HowToUse';
import MarketPerformance from './MarketPerformance';
import MarketNews from './MarketNews';
import { MarketRegion } from '@/types/market/indexTypes';

interface LandingViewProps {
  recentSearches: string[];
  featuredSymbols: { symbol: string; name: string }[];
  onSelectSymbol: (symbol: string) => void;
  marketData?: MarketRegion[];
  isLoadingMarketData?: boolean;
  onRefreshMarketData?: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ 
  recentSearches, 
  featuredSymbols, 
  onSelectSymbol,
  marketData = [],
  isLoadingMarketData = false,
  onRefreshMarketData
}) => {
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 pb-20"
    >
      <HeroSection featuredSymbols={featuredSymbols} />
      
      <MarketPerformance 
        marketData={marketData} 
        isLoading={isLoadingMarketData}
        onRefresh={onRefreshMarketData}
      />
      
      <FeaturedCompanies 
        featuredSymbols={featuredSymbols} 
        onSelectSymbol={onSelectSymbol} 
      />
      
      {recentSearches.length > 0 && (
        <RecentSearches 
          recentSearches={recentSearches} 
          onSelectSymbol={onSelectSymbol} 
        />
      )}
      
      <MarketNews newsData={[]} />
      
      <FeatureCards />
      
      <HowToUse />
      
      <FAQSection />
    </motion.div>
  );
};

export default LandingView;
