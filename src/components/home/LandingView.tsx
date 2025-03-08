
import React from "react";
import HeroSection from "./HeroSection";
import MarketPerformance from "./MarketPerformance";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import HowToUse from "./HowToUse";
import MarketNews from "./MarketNews";
import RecentSearches from "./RecentSearches";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import { MarketRegion } from "@/services/api/marketData/indicesService";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketIndices } from "@/services/api/marketData/indicesService";

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
  // Use React Query to fetch market indices
  const { data: marketData, isLoading: isIndicesLoading } = useQuery({
    queryKey: ['marketIndices'],
    queryFn: fetchMarketIndices,
  });

  return (
    <div className="space-y-10 pb-10">
      <HeroSection featuredSymbols={featuredSymbols} />
      
      {recentSearches.length > 0 && (
        <RecentSearches 
          recentSearches={recentSearches} 
          onSelectSymbol={onSelectSymbol} 
        />
      )}
      
      <MarketPerformance 
        marketData={marketData || []} 
        isLoading={isIndicesLoading} 
      />
      
      <FeaturedCompanies 
        featuredSymbols={featuredSymbols}
        onSelectSymbol={onSelectSymbol}
      />
      
      <FeatureCards />
      
      <HowToUse />
      
      <MarketNews newsData={[]} />
    </div>
  );
};

export default LandingView;
