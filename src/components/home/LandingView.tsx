import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import RecentSearches from "./RecentSearches";
import FAQSection from "./FAQSection";
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
      {/* Hero Section with search bar integrated - side by side layout */}
      <HeroSection featuredSymbols={featuredSymbols} />
      
      {/* Feature Cards Section - full width */}
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
      
      {/* Featured Companies Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 bg-gradient-to-t from-muted/10 to-background">
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
      
      {/* FAQ Section (replacing How To Use) */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <FAQSection />
        </motion.div>
      </div>
      
      {/* Recent Searches if available */}
      {recentSearches.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <RecentSearches 
              recentSearches={recentSearches} 
              onSelectSymbol={onSelectSymbol} 
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LandingView;
