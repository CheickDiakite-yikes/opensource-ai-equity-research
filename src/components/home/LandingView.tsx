
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import RecentSearches from "./RecentSearches";
import HowToUse from "./HowToUse";
import MarketPerformance from "./MarketPerformance";
import MarketNews from "./marketNews/MarketNews";
import { fetchMarketIndices, fetchMarketNews } from "@/services/api/marketDataService";
import { toast } from "sonner";

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
  const [marketData, setMarketData] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    const getMarketData = async () => {
      try {
        setIsLoadingMarkets(true);
        const data = await fetchMarketIndices();
        setMarketData(data);
        console.log("Market data loaded:", data);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        toast.error("Unable to load market data. Please try again later.");
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    const getMarketNews = async () => {
      try {
        setIsLoadingNews(true);
        const news = await fetchMarketNews(6); // Fetch 6 news articles
        setMarketNews(news);
        console.log("Market news loaded:", news);
      } catch (error) {
        console.error("Failed to fetch market news:", error);
        toast.error("Unable to load market news. Please try again later.");
      } finally {
        setIsLoadingNews(false);
      }
    };

    getMarketData();
    getMarketNews();
  }, []);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-0 my-12"
    >
      <HeroSection />
      <FeatureCards />
      <FeaturedCompanies 
        featuredSymbols={featuredSymbols} 
        onSelectSymbol={onSelectSymbol} 
      />
      <MarketPerformance 
        marketData={marketData} 
        isLoading={isLoadingMarkets} 
      />
      <MarketNews 
        newsData={marketNews} 
        isLoading={isLoadingNews} 
      />
      <RecentSearches 
        recentSearches={recentSearches} 
        onSelectSymbol={onSelectSymbol} 
      />
      <HowToUse />
    </motion.div>
  );
};

export default LandingView;
