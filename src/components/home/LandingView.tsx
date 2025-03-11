
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturedCompanies from "./FeaturedCompanies";
import FeatureCards from "./FeatureCards";
import FAQSection from "./FAQSection";
import PopularStocksCarousel from "./PopularStocksCarousel";
import MarketNews from "./MarketNews";
import { fetchMarketNews } from "@/services/api/marketDataService";
import { toast } from "sonner";
import { getStockQuote } from "@/lib/api/fmpApi";

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

// Popular stocks to display in the carousel
const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "GOOG", name: "Alphabet Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "PYPL", name: "PayPal Holdings, Inc." },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
  { symbol: "CSCO", name: "Cisco Systems, Inc." },
  { symbol: "CRM", name: "Salesforce, Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "QCOM", name: "Qualcomm Incorporated" },
  { symbol: "PEP", name: "PepsiCo, Inc." },
  { symbol: "KO", name: "The Coca-Cola Company" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "HD", name: "The Home Depot, Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "NKE", name: "NIKE, Inc." }
];

const LandingView: React.FC<LandingViewProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  const [stockData, setStockData] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    const getStockData = async () => {
      try {
        setIsLoadingStocks(true);
        
        // Create an array of promises to fetch quotes for all popular stocks
        const promises = POPULAR_STOCKS.map(stock => getStockQuote(stock.symbol));
        const results = await Promise.allSettled(promises);
        
        // Filter successful results and map them to our simplified format
        const validResults = results
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(quote => quote); // Filter out any null values
        
        setStockData(validResults);
        console.log("Stock data loaded:", validResults);
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
        toast.error("Unable to load stock data. Please try again later.");
      } finally {
        setIsLoadingStocks(false);
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

    getStockData();
    getMarketNews();
  }, []);

  const handleRefreshStocks = async () => {
    try {
      setIsLoadingStocks(true);
      toast.info("Refreshing stock data...");
      
      // Create an array of promises to fetch quotes for all popular stocks
      const promises = POPULAR_STOCKS.map(stock => getStockQuote(stock.symbol));
      const results = await Promise.allSettled(promises);
      
      // Filter successful results and map them to our simplified format
      const validResults = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(quote => quote); // Filter out any null values
      
      setStockData(validResults);
      toast.success("Stock data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh stock data:", error);
      toast.error("Unable to refresh stock data. Please try again later.");
    } finally {
      setIsLoadingStocks(false);
    }
  };

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
      
      {/* Popular Stocks Carousel */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <PopularStocksCarousel 
            stockData={stockData} 
            isLoading={isLoadingStocks}
            onRefresh={handleRefreshStocks}
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
