
import React from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Calendar, ImageOff, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import { format } from "date-fns";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { fetchCompanyLogo } from "@/services/api/marketData";

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
    
    // If this is a company news item with a ticker, try to show company logo
    const ticker = e.currentTarget.getAttribute('data-ticker');
    if (ticker) {
      displayCompanyLogo(e.currentTarget, ticker);
    } else {
      // Fallback to generic placeholder
      e.currentTarget.src = '/placeholder.svg';
      e.currentTarget.classList.add('object-contain', 'bg-muted/30', 'p-4');
      e.currentTarget.classList.remove('object-cover');
    }
  }

  async function displayCompanyLogo(imgElement: HTMLImageElement, ticker: string) {
    try {
      console.log("Attempting to fetch logo for ticker:", ticker);
      // Extract the first ticker if multiple are present (comma-separated)
      const primaryTicker = ticker.split(',')[0].trim();
      
      // Clean up ticker format - remove exchange prefix if present
      const cleanTicker = primaryTicker.includes(':') 
        ? primaryTicker.split(':')[1] 
        : primaryTicker;
        
      const logoUrl = await fetchCompanyLogo(cleanTicker);
      
      if (logoUrl) {
        imgElement.src = logoUrl;
        imgElement.classList.add('object-contain', 'bg-white', 'p-2');
        imgElement.classList.remove('object-cover');
      } else {
        // Use a company icon as fallback
        imgElement.src = '/placeholder.svg';
        const iconContainer = document.createElement('div');
        iconContainer.className = 'absolute inset-0 flex items-center justify-center';
        iconContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M12 14h.01"/></svg>';
        imgElement.parentNode?.appendChild(iconContainer);
      }
    } catch (error) {
      console.error("Error fetching company logo:", error);
      imgElement.src = '/placeholder.svg';
      imgElement.classList.add('object-contain', 'bg-muted/30', 'p-4');
      imgElement.classList.remove('object-cover');
    }
  }

  // Function to determine if an image URL is valid
  function getImageUrl(imageUrl: string | undefined, tickers?: string): string {
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

  // Pre-process news data to load company logos for items with tickers
  React.useEffect(() => {
    newsData.forEach(article => {
      if (article.tickers) {
        // Preload company logos for articles with tickers
        const ticker = article.tickers.split(',')[0].trim();
        const cleanTicker = ticker.includes(':') ? ticker.split(':')[1] : ticker;
        fetchCompanyLogo(cleanTicker).catch(console.error);
      }
    });
  }, [newsData]);
  
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
              const imageUrl = getImageUrl(article.image, article.tickers);
              
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
                        data-ticker={article.tickers}
                      />
                      {(imageUrl === '/placeholder.svg' && !article.tickers) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageOff className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                      {(imageUrl === '/placeholder.svg' && article.tickers) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building className="h-10 w-10 text-muted-foreground/50" />
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
