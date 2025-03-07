import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import RecentSearches from "./RecentSearches";
import HowToUse from "./HowToUse";
import MarketPerformance from "./MarketPerformance";
import MarketNews from "./MarketNews";
import { SearchBar } from "@/components/search";
import { fetchMarketIndices, fetchMarketNews } from "@/services/api/marketDataService";
import { toast } from "sonner";
import { Search } from "lucide-react";

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
    <div className="space-y-8 my-6">
      <HeroSection />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="max-w-2xl mx-auto px-4 -mt-6 relative z-10"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Search className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-medium">Search for a Company or Symbol</h3>
          </div>
          <SearchBar 
            featuredSymbols={featuredSymbols}
            className="shadow-sm"
            placeholder="Enter a company name or ticker symbol..."
          />
        </div>
      </motion.div>
      
      <FeatureCards />
      
      <FeaturedCompanies 
        featuredSymbols={featuredSymbols} 
        onSelectSymbol={onSelectSymbol} 
      />
      
      <div className="grid md:grid-cols-2 gap-8">
        <MarketPerformance 
          marketData={marketData} 
          isLoading={isLoadingMarkets} 
        />
        <MarketNews 
          newsData={marketNews} 
          isLoading={isLoadingNews} 
        />
      </div>
      
      <RecentSearches 
        recentSearches={recentSearches} 
        onSelectSymbol={onSelectSymbol} 
      />
      <HowToUse />
    </div>
  );
};

export default LandingView;
