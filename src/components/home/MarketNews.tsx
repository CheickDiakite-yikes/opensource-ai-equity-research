
import React from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { MarketNewsArticle, fetchMarketNews } from "@/services/api/marketData/newsService";
import NewsCard from "./marketNews/NewsCard";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface MarketNewsProps {
  newsData: MarketNewsArticle[];
  isLoading?: boolean;
}

// Featured companies to fetch press releases from
const FEATURED_COMPANIES = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];

const MarketNews: React.FC<MarketNewsProps> = ({ 
  newsData: initialNewsData,
  isLoading: initialLoading = false 
}) => {
  // Use React Query to fetch press releases from multiple companies
  const { data: pressReleaseData, isLoading: isPressReleasesLoading } = useQuery({
    queryKey: ['pressReleases'],
    queryFn: async () => {
      console.log('Fetching press releases from featured companies');
      
      // Randomly select 2 companies from the featured list
      const shuffled = [...FEATURED_COMPANIES].sort(() => 0.5 - Math.random());
      const selectedCompanies = shuffled.slice(0, 2);
      
      // Fetch press releases for selected companies
      const results = await Promise.all(
        selectedCompanies.map(symbol => 
          fetchMarketNews(3, symbol)
            .catch(error => {
              console.error(`Error fetching press releases for ${symbol}:`, error);
              return [];
            })
        )
      );
      
      // Combine and sort by datetime (most recent first)
      const combinedResults = results.flat().sort((a, b) => 
        (b.datetime || 0) - (a.datetime || 0)
      );
      
      console.log(`Fetched ${combinedResults.length} press releases from ${selectedCompanies.join(', ')}`);
      return combinedResults;
    },
    // Combine with initial news data if available
    initialData: initialNewsData && initialNewsData.length > 0 ? initialNewsData : undefined,
  });
  
  // Determine final loading state and news data
  const isLoading = initialLoading || isPressReleasesLoading;
  const newsData = pressReleaseData || initialNewsData;
  
  if (isLoading) {
    return (
      <div className="relative py-8">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <SectionHeader 
            title="Recent Market News"
            description="Stay informed with the latest financial market news and updates."
            icon={<Newspaper className="w-6 h-6 text-primary" />}
          />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
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
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            title="Recent Market News & Press Releases"
            description="Stay informed with the latest press releases and financial market news from top companies."
            icon={<Newspaper className="w-6 h-6 text-primary" />}
          />
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {newsData && newsData.length > 0 ? (
              newsData.slice(0, 6).map((article, index) => (
                <NewsCard 
                  key={`${article.id || index}-${article.headline}`} 
                  article={article}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground">No news or press releases available at this time.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketNews;
