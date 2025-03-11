
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";
import { Button } from "@/components/ui/button";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PopularStocksCarouselProps {
  stockData: StockQuote[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const PopularStocksCarousel: React.FC<PopularStocksCarouselProps> = ({ 
  stockData,
  isLoading = false,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <SectionHeader 
            title="Popular Stocks"
            description="Track performance of widely-traded stocks in real-time."
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
          />
          <div className="flex overflow-hidden space-x-4 py-4">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="min-w-[220px] h-[140px] animate-pulse bg-card/50 backdrop-blur-sm border border-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex justify-between items-center mb-4">
          <SectionHeader 
            title="Popular Stocks"
            description="Track performance of widely-traded stocks in real-time."
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
          />
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {stockData.map((stock) => (
              <CarouselItem key={stock.symbol} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <Card className="h-full overflow-hidden border border-muted/60 hover:border-primary/40 transition-colors duration-300 bg-card/80 backdrop-blur-sm hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[160px]" title={stock.name}>
                            {stock.name}
                          </span>
                        </div>
                        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                          stock.changePercent >= 0 
                            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' 
                            : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
                        }`}>
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">
                            ${stock.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                          <span className={`text-sm font-medium ${
                            stock.change >= 0 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-4">
            <CarouselPrevious className="relative static md:absolute" />
            <CarouselNext className="relative static md:absolute" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default PopularStocksCarousel;
