
import React from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Calendar, ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import { MarketNewsArticle } from "@/services/api/marketDataService";
import { format } from "date-fns";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface MarketNewsProps {
  newsData: MarketNewsArticle[];
  isLoading?: boolean;
}

const MarketNews: React.FC<MarketNewsProps> = ({ 
  newsData,
  isLoading = false 
}) => {
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
  
  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString.split(' ')[0]; // Fallback to just the date part
    }
  }

  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    console.log("Image failed to load, using placeholder");
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.classList.add('object-contain', 'bg-muted/30', 'p-4');
    e.currentTarget.classList.remove('object-cover');
  }

  // Function to determine if an image URL is valid
  function getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/placeholder.svg';
    
    // Check if the URL seems valid (has https and common image extensions)
    const isValidUrl = imageUrl.startsWith('http') && 
      (imageUrl.endsWith('.jpg') || 
       imageUrl.endsWith('.jpeg') || 
       imageUrl.endsWith('.png') || 
       imageUrl.endsWith('.webp') ||
       imageUrl.endsWith('.gif'));
    
    if (!isValidUrl) {
      console.log("Invalid image URL detected:", imageUrl);
      return '/placeholder.svg';
    }
    
    return imageUrl;
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
            title="Recent Market News"
            description="Stay informed with the latest financial market news and updates."
            icon={<Newspaper className="w-6 h-6 text-primary" />}
          />
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {newsData.map((article, index) => {
              const imageUrl = getImageUrl(article.image);
              
              return (
                <Card 
                  key={index} 
                  className="bg-card/70 backdrop-blur-sm border border-muted/50 overflow-hidden shadow-md hover-card-highlight transition-all duration-300 hover:shadow-lg group"
                >
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden bg-muted/30">
                      <img 
                        src={imageUrl}
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={handleImageError}
                        crossOrigin="anonymous"
                      />
                      {(imageUrl === '/placeholder.svg') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageOff className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                      {article.tickers && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {article.tickers.replace(/,/g, ' · ')}
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(article.date)}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{article.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content}
                      </p>
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2 pt-2 border-t border-muted"
                      >
                        Read full article <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketNews;
