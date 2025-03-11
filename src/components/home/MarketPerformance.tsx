
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LineChart, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SectionHeader from "./SectionHeader";
import { MarketIndex, MarketRegion } from "@/services/api/marketData/indicesService";
import { fetchMarketIndices } from "@/services/api/marketDataService";
import { toast } from "sonner";

interface MarketPerformanceProps {
  marketData: MarketRegion[];
  isLoading?: boolean;
}

const MarketPerformance: React.FC<MarketPerformanceProps> = ({ 
  marketData,
  isLoading = false 
}) => {
  const [data, setData] = useState<MarketRegion[]>(marketData);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const freshData = await fetchMarketIndices();
      setData(freshData);
      setLastUpdated(new Date());
      console.log("Market data refreshed:", freshData);
    } catch (error) {
      console.error("Failed to refresh market data:", error);
      toast.error("Unable to refresh market data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Refresh data every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [fetchData]);
  
  if (loading) {
    return (
      <div className="relative py-12">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <SectionHeader 
            title="Market Performance"
            description="Track global market indices performance in real-time."
            icon={<LineChart className="w-6 h-6 text-primary" />}
          />
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-muted animate-pulse hover-card-highlight">
                <CardContent className="p-6">
                  <div className="h-7 w-32 bg-muted rounded mb-6"></div>
                  <div className="space-y-4">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex justify-between items-center py-2 border-b border-muted/30">
                        <div className="h-5 w-24 bg-muted/60 rounded"></div>
                        <div className="h-5 w-20 bg-muted/60 rounded"></div>
                        <div className="h-5 w-16 bg-muted/60 rounded"></div>
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
    <div className="relative py-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 relative z-10"
        >
          <div className="flex justify-between items-center mb-6">
            <SectionHeader 
              title="Market Performance"
              description="Track global market indices performance in real-time."
              icon={<LineChart className="w-6 h-6 text-primary" />}
            />
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data.map((region) => (
              <Card 
                key={region.name} 
                className="bg-card/70 backdrop-blur-sm border border-muted/50 overflow-hidden shadow-md hover-card-highlight"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-primary rounded-full"></div>
                    {region.name}
                  </h3>
                  <div className="space-y-1">
                    {region.indices.map((index) => (
                      <div 
                        key={index.symbol} 
                        className="flex justify-between items-center py-3 border-b border-border/30 last:border-0 group hover:bg-muted/20 rounded px-1 transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground/90 w-[40%] truncate" title={index.name}>
                          {index.name}
                        </div>
                        <div className="text-sm font-medium text-foreground/90 w-[30%] text-right">
                          {Number(index.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div 
                          className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md w-[25%] justify-end ${
                            index.changePercent >= 0 
                              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' 
                              : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
                          }`}
                        >
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
