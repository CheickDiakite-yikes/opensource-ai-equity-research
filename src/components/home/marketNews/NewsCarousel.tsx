
import React from "react";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import NewsCard from "./NewsCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

interface NewsCarouselProps {
  newsData: MarketNewsArticle[];
  isLoading?: boolean;
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ 
  newsData,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {[0, 1, 2].map((i) => (
            <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
              <Card className="h-[320px] bg-card/50 backdrop-blur-sm border-muted animate-pulse" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative static mx-1" />
          <CarouselNext className="relative static mx-1" />
        </div>
      </Carousel>
    );
  }

  if (!newsData || newsData.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No news available at this time.</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {newsData.slice(0, 6).map((article, index) => (
          <CarouselItem key={`${article.id || index}-${article.headline}`} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <NewsCard article={article} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-4">
        <CarouselPrevious className="relative static mx-1" />
        <CarouselNext className="relative static mx-1" />
      </div>
    </Carousel>
  );
};

export default NewsCarousel;
