
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { fetchSectorPerformance } from "@/services/api/marketDataService";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";

interface SectorData {
  date: string;
  sector: string;
  exchange?: string;
  averageChange: number;
}

interface SectorPerformanceProps {
  initialData?: SectorData[];
  isLoading?: boolean;
}

const SectorPerformance: React.FC<SectorPerformanceProps> = ({ 
  initialData = [], 
  isLoading = false 
}) => {
  const [sectors, setSectors] = useState<SectorData[]>(initialData);
  const [loading, setLoading] = useState<boolean>(isLoading || initialData.length === 0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialData.length > 0 ? new Date() : null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSectorPerformance();
      
      // Ensure we have valid data
      if (data && Array.isArray(data) && data.length > 0) {
        // Format data correctly
        const formattedData = data.map(item => ({
          date: item.date || new Date().toISOString().split('T')[0],
          sector: item.sector,
          averageChange: typeof item.averageChange === 'number' 
            ? item.averageChange 
            : parseFloat(item.changesPercentage?.replace('%', '')) / 100 || 0
        }));
        
        setSectors(formattedData);
        setLastUpdated(new Date());
        console.log("Sector performance data loaded:", formattedData);
      } else {
        console.warn("Empty or invalid sector performance data received");
        toast.error("Unable to load sector data. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to fetch sector performance:", error);
      toast.error("Unable to load sector performance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData.length === 0) {
      fetchData();
    }
    
    // Refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchData, initialData.length]);

  // Sort sectors by performance
  const sortedSectors = [...sectors].sort((a, b) => b.averageChange - a.averageChange);

  if (loading) {
    return (
      <div className="relative py-8">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <SectionHeader 
            title="Sector Performance"
            description="Track market sector performance in real-time."
            icon={<Layers className="w-6 h-6 text-primary" />}
          />
          <Card className="bg-card/50 backdrop-blur-sm border-muted animate-pulse">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-muted rounded-md">
                    <div className="h-5 w-32 bg-muted/60 rounded"></div>
                    <div className="h-5 w-20 bg-muted/60 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              title="Sector Performance"
              description="Track market sector performance in real-time."
              icon={<Layers className="w-6 h-6 text-primary" />}
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
          
          <Card className="bg-card/70 backdrop-blur-sm border border-muted/50 overflow-hidden shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedSectors.length > 0 ? (
                  sortedSectors.map((sector) => (
                    <div 
                      key={sector.sector}
                      className="flex items-center justify-between p-3 border border-border/30 rounded-md hover:bg-muted/20 transition-colors"
                    >
                      <span className="font-medium text-sm">{sector.sector}</span>
                      <div 
                        className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                          sector.averageChange >= 0 
                            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' 
                            : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
                        }`}
                      >
                        {sector.averageChange >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {sector.averageChange >= 0 ? '+' : ''}{(sector.averageChange * 100).toFixed(2)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10 text-muted-foreground">
                    No sector data available at this time
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SectorPerformance;
