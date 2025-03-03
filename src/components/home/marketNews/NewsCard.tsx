
import React from "react";
import { ExternalLink, Calendar, ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import { formatDate } from "@/lib/utils";

interface NewsCardProps {
  article: MarketNewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  // Format the date from Unix timestamp if available
  const formattedDate = article.datetime 
    ? formatDate(new Date(article.datetime * 1000).toISOString()) 
    : article.publishedDate 
      ? formatDate(article.publishedDate)
      : "Unknown date";
  
  // Use headline or title for display
  const displayTitle = article.headline || article.title || "No title available";
  
  // Use summary or text for display
  const displayText = article.summary || article.text || "No description available";
  
  // Use source or site for display
  const source = article.source || article.site || "Unknown source";
  
  // Format source name for display
  const siteName = source.replace(/^www\./, '').replace(/\.(com|org|net|io).*$/, '');
  
  // Extract symbol from related field if available
  const symbol = article.symbol || (article.related && article.related.match(/[A-Z]+/) ? article.related.match(/[A-Z]+/)[0] : null);
  
  return (
    <Card className="bg-card/70 backdrop-blur-sm border border-muted/50 overflow-hidden shadow-md hover-card-highlight transition-all duration-300 hover:shadow-lg group">
      <CardContent className="p-0">
        <div className="h-48 bg-muted/60 rounded-t-lg overflow-hidden relative">
          {article.image ? (
            <img 
              src={article.image}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-200">
              <ImageOff className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {symbol && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              {symbol}
            </div>
          )}
          
          {article.category && !symbol && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded capitalize">
              {article.category}
            </div>
          )}
        </div>
        
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
            <span className="font-medium">{source}</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {displayTitle}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{displayTitle}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {displayText}
          </p>
          
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2 pt-2 border-t border-muted"
          >
            Read on {siteName} <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
