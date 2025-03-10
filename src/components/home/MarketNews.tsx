
import React from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { MarketNewsArticle, fetchMarketNews } from "@/services/api/marketData/newsService";
import NewsCard from "./marketNews/NewsCard";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-mobile";
import NewsCarousel from "./marketNews/NewsCarousel";
import { cn } from "@/lib/utils";

interface MarketNewsProps {
  newsData: MarketNewsArticle[];
  isLoading?: boolean;
}

const MarketNews: React.FC<MarketNewsProps> = ({ 
  newsData: initialNewsData,
  isLoading: initialLoading = false 
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Use React Query to fetch general market news
  const { data: marketNewsData, isLoading: isNewsLoading } = useQuery({
    queryKey: ['marketNews'],
    queryFn: async () => {
      console.log('Fetching general market news');
      
      // Fetch general market news
      const results = await fetchMarketNews(6, 'general');
      
      console.log(`Fetched ${results.length} market news articles`);
      return results;
    },
    // Combine with initial news data if available
    initialData: initialNewsData && initialNewsData.length > 0 ? initialNewsData : undefined,
  });
  
  // Determine final loading state and news data
  const isLoading = initialLoading || isNewsLoading;
  const newsData = marketNewsData || initialNewsData;
  
  return (
    <div className={cn(
      "relative py-6 md:py-8 bg-gradient-to-b from-muted/20 to-background",
      isMobile ? "px-1" : ""
    )}>
      <div className="container mx-auto px-2 md:px-4 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 md:mb-8 relative z-10"
        >
          <SectionHeader 
            title="Recent Market News"
            description="Stay informed with the latest financial market news and updates."
            icon={<Newspaper className="w-6 h-6 text-primary" />}
          />
          
          {isMobile ? (
            <NewsCarousel 
              newsData={newsData} 
              isLoading={isLoading} 
            />
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                // Desktop loading skeleton
                [0, 1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="bg-card/50 backdrop-blur-sm border-muted animate-pulse hover-card-highlight">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted/60 rounded-t-lg"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-4 w-16 bg-muted/60 rounded"></div>
                        <div className="h-6 w-full bg-muted/80 rounded"></div>
                        <div className="h-6 w-3/4 bg-muted/80 rounded"></div>
                        <div className="h-4 w-24 bg-muted/60 rounded mt-4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : newsData && newsData.length > 0 ? (
                // Desktop news grid
                newsData.slice(0, 6).map((article, index) => (
                  <NewsCard 
                    key={`${article.id || index}-${article.headline}`} 
                    article={article}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">No news available at this time.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MarketNews;
