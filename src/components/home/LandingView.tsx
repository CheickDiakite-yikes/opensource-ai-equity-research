
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import FAQSection from "./FAQSection";
import MarketPerformance from "./MarketPerformance";
import SectorPerformance from "./SectorPerformance";
import MarketNews from "./MarketNews";
import { fetchMarketIndices, fetchMarketNews, fetchSectorPerformance } from "@/services/api/marketDataService";
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
  featuredSymbols, 
  onSelectSymbol 
}) => {
  const [marketData, setMarketData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
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

    const getSectorData = async () => {
      try {
        setIsLoadingSectors(true);
        const data = await fetchSectorPerformance();
        setSectorData(data);
        console.log("Sector data loaded:", data);
      } catch (error) {
        console.error("Failed to fetch sector data:", error);
        toast.error("Unable to load sector performance data. Please try again later.");
      } finally {
        setIsLoadingSectors(false);
      }
    };

    const getMarketNews = async () => {
      try {
        setIsLoadingNews(true);
        const news = await fetchMarketNews(6);
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
    getSectorData();
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
      <div className="py-6">
        <FeatureCards />
      </div>
      
      {/* Market Performance Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
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
      </div>
      
      {/* Sector Performance Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectorPerformance 
            initialData={sectorData} 
            isLoading={isLoadingSectors} 
          />
        </motion.div>
      </div>
      
      {/* Featured Companies Section */}
      <div id="featured-companies-section" className="max-w-screen-xl mx-auto px-4 py-6 bg-gradient-to-t from-muted/10 to-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <FeaturedCompanies 
            featuredSymbols={featuredSymbols} 
            onSelectSymbol={onSelectSymbol} 
          />
        </motion.div>
      </div>
      
      {/* News Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 bg-gradient-to-b from-muted/10 to-background">
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
      </div>
      
      {/* FAQ Section */}
      <div className="w-full py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <FAQSection />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LandingView;
