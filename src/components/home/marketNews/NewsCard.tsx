
import React from "react";
import { ExternalLink, Calendar, ImageOff, ThumbsUp, ThumbsDown, MinusCircle } from "lucide-react";
import { Card, CardContent, CardImage } from "@/components/ui/card";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import { format, parseISO } from "date-fns";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import CompanyLogoFallback from "./CompanyLogoFallback";
import { isValidImageUrl } from "@/lib/utils";

interface NewsCardProps {
  article: MarketNewsArticle;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, index }) => {
  const imageUrl = getImageUrl(article.image, article.symbol);
  
  function formatDate(dateString: string) {
    try {
      let date;
      
      // Handle date string in format "YYYY-MM-DD HH:MM:SS"
      if (dateString.includes(' ')) {
        date = new Date(dateString.replace(' ', 'T'));
      } else {
        date = parseISO(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return dateString.split(' ')[0];
      }
      
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return dateString.split(' ')[0];
    }
  }

  function getImageUrl(imageUrl: string | undefined, symbol?: string | null): string {
    if (!imageUrl) return '/placeholder.svg';
    
    return isValidImageUrl(imageUrl) ? imageUrl : '/placeholder.svg';
  }

  function getSentimentIcon(sentiment?: string) {
    if (!sentiment) return null;
    
    switch(sentiment.toLowerCase()) {
      case 'positive':
        return <ThumbsUp className="h-3 w-3 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-3 w-3 text-red-500" />;
      case 'neutral':
        return <MinusCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  }

  function getSentimentColor(sentiment?: string): string {
    if (!sentiment) return "bg-muted text-muted-foreground";
    
    switch(sentiment.toLowerCase()) {
      case 'positive':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'negative':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case 'neutral':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  }
  
  return (
    <Card 
      key={index} 
      className="bg-card/70 backdrop-blur-sm border border-muted/50 overflow-hidden shadow-md hover-card-highlight transition-all duration-300 hover:shadow-lg group"
    >
      <CardContent className="p-0">
        <CardImage
          src={imageUrl}
          alt={article.title}
          aspectRatio="video"
          className="group-hover:scale-105 transition-transform duration-500"
          fallback={
            article.symbol ? 
              <CompanyLogoFallback symbol={article.symbol} /> : 
              <div className="flex items-center justify-center h-full">
                <ImageOff className="h-10 w-10 text-muted-foreground/50" />
              </div>
          }
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {article.symbol && (
            <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              {article.symbol}
            </div>
          )}
          {article.sentiment && (
            <Badge variant="outline" className={`text-xs px-2 py-1 ${getSentimentColor(article.sentiment)}`}>
              <span className="flex items-center gap-1">
                {getSentimentIcon(article.sentiment)}
                {article.sentiment}
                {article.sentimentScore && ` (${article.sentimentScore.toFixed(2)})`}
              </span>
            </Badge>
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
