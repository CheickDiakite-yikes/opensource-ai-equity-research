
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import RecentSearches from "./RecentSearches";
import HowToUse from "./HowToUse";
import MarketPerformance from "./MarketPerformance";
import MarketNews from "./MarketNews";
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
      className="overflow-hidden"
    >
      {/* Hero Section with search bar integrated */}
      <HeroSection featuredSymbols={featuredSymbols} />
      
      {/* Feature Cards Section */}
      <FeatureCards />
      
      {/* Market Data and Featured Companies in a side-by-side layout */}
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <MarketPerformance 
              marketData={marketData} 
              isLoading={isLoadingMarkets} 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <FeaturedCompanies 
              featuredSymbols={featuredSymbols} 
              onSelectSymbol={onSelectSymbol} 
            />
          </motion.div>
        </div>
      </div>
      
      {/* News and Recent Searches in a side-by-side layout */}
      <div className="max-w-screen-xl mx-auto px-6 py-16 bg-gradient-to-t from-muted/30 to-background">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <MarketNews 
              newsData={marketNews} 
              isLoading={isLoadingNews} 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col"
          >
            <RecentSearches 
              recentSearches={recentSearches} 
              onSelectSymbol={onSelectSymbol} 
            />
            
            <div className="mt-auto pt-8">
              <HowToUse />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingView;
