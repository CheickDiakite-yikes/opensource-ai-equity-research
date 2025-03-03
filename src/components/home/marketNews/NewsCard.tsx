
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
import { formatDate } from "@/lib/utils"; // Import from utils instead of defining locally

interface NewsCardProps {
  article: MarketNewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border border-muted/50 overflow-hidden shadow-md hover-card-highlight transition-all duration-300 hover:shadow-lg group">
      <CardContent className="p-0">
        <div className="h-48 bg-muted/60 rounded-t-lg overflow-hidden relative">
          {article.image ? (
            <img 
              src={article.image}
              alt={article.title}
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
          
          {article.symbol && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              {article.symbol}
            </div>
          )}
        </div>
        
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(article.publishedDate)}</span>
            </div>
            {article.publisher && (
              <span className="font-medium">{article.publisher}</span>
            )}
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
            {article.text}
          </p>
          
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2 pt-2 border-t border-muted"
          >
            Read on {article.site} <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
