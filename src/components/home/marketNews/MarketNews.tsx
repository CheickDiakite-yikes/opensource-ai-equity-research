
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import SectionHeader from "../SectionHeader";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import NewsCard from "./NewsCard";
import NewsCardSkeleton from "./NewsCardSkeleton";

interface MarketNewsProps {
  newsData: MarketNewsArticle[];
  isLoading?: boolean;
}

const MarketNews: React.FC<MarketNewsProps> = ({ 
  newsData,
  isLoading = false 
}) => {
  // Removed fetchCompanyLogo usage as requested
  
  return (
    <div className="relative py-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 relative z-10"
        >
          <SectionHeader 
            title="Recent Market News"
            description="Stay informed with the latest financial market news and updates."
            icon={<Newspaper className="w-6 h-6 text-primary" />}
          />
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                {newsData.map((article, index) => (
                  <NewsCard key={index} article={article} index={index} />
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketNews;
