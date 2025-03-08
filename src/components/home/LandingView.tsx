
import React from "react";
import HeroSection from "./HeroSection";
import MarketPerformance from "./MarketPerformance";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import HowToUse from "./HowToUse";
import MarketNews from "./MarketNews";
import RecentSearches from "./RecentSearches";

interface LandingViewProps {
  recentSearches: string[];
  featuredSymbols: {symbol: string, name: string}[];
  onSelectSymbol: (symbol: string) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ 
  recentSearches, 
  featuredSymbols,
  onSelectSymbol 
}) => {
  return (
    <div className="space-y-10 pb-10">
      <HeroSection featuredSymbols={featuredSymbols} />
      
      {recentSearches.length > 0 && (
        <RecentSearches 
          recentSearches={recentSearches} 
          onSelectSymbol={onSelectSymbol} 
        />
      )}
      
      <MarketPerformance />
      
      <FeaturedCompanies 
        featuredSymbols={featuredSymbols}
        onSelectSymbol={onSelectSymbol}
      />
      
      <FeatureCards />
      
      <HowToUse />
      
      <MarketNews />
    </div>
  );
};

export default LandingView;
