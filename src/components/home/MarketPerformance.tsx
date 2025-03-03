
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "./SectionHeader";

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketRegion {
  name: string;
  indices: MarketIndex[];
}

interface MarketPerformanceProps {
  marketData: MarketRegion[];
  isLoading?: boolean;
}

const MarketPerformance: React.FC<MarketPerformanceProps> = ({ 
  marketData,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="relative py-12">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <SectionHeader 
            title="Market Performance"
            description="Track global market indices performance in real-time."
          />
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-muted animate-pulse">
                <CardContent className="p-6">
                  <div className="h-7 w-32 bg-muted rounded mb-6"></div>
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((j) => (
                      <div key={j} className="flex justify-between items-center">
                        <div className="h-6 w-24 bg-muted rounded"></div>
                        <div className="h-6 w-20 bg-muted rounded"></div>
                        <div className="h-6 w-16 bg-muted rounded"></div>
                      </div>
                    ))}
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
    <div className="relative py-12">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 relative z-10"
        >
          <SectionHeader 
            title="Market Performance"
            description="Track global market indices performance in real-time."
          />
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {marketData.map((region) => (
              <Card key={region.name} className="bg-card/50 backdrop-blur-sm border-muted overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{region.name}</h3>
                  <div className="space-y-4">
                    {region.indices.map((index) => (
                      <div 
                        key={index.symbol} 
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <div className="text-sm font-medium text-foreground">{index.name}</div>
                        <div className="text-sm font-medium text-foreground">{Number(index.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className={`flex items-center text-sm font-semibold ${index.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {index.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketPerformance;
