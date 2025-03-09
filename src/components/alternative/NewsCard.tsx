
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { CompanyNews } from '@/types/alternative';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: CompanyNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const formattedDate = formatDistanceToNow(
    new Date(news.datetime * 1000),
    { addSuffix: true }
  );

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base font-medium line-clamp-2">{news.headline}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        {news.image && (
          <div className="mb-3">
            <img 
              src={news.image} 
              alt={news.headline} 
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{news.summary}</p>
        <div className="flex items-center text-xs text-muted-foreground mt-auto">
          <span className="font-semibold">{news.source}</span>
          <span className="mx-2">•</span>
          <span>{formattedDate}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={news.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            Read Article
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
