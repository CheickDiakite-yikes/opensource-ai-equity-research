
import React from 'react';
import { InsiderTradingStatsResponse, InsiderTradingStats } from '@/types/alternative/ownershipTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorDisplay from '../reports/ErrorDisplay';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, PieChart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface InsiderTradingStatsSectionProps {
  data: InsiderTradingStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const InsiderTradingStatsSection: React.FC<InsiderTradingStatsSectionProps> = ({
  data,
  isLoading,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        title="Insider Trading Statistics Unavailable"
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data || !data.tradingStats || data.tradingStats.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No Insider Trading Statistics Available</h3>
        <p className="text-muted-foreground">
          There is no insider trading data available for this company at this time.
        </p>
      </div>
    );
  }

  // Sort by newest year and quarter
  const sortedStats = [...data.tradingStats].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter - a.quarter;
  });

  // Get the most recent record for the summary
  const latestStats = sortedStats[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Insider Trading Statistics</h3>
        <p className="text-muted-foreground">
          Summary of insider trading activity, including purchases, sales, and transaction patterns.
        </p>
      </div>

      {latestStats && (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <InsightCard 
              title="Transaction Summary"
              value={`${latestStats.acquiredTransactions} buys / ${latestStats.disposedTransactions} sells`}
              icon={<PieChart className="h-5 w-5 text-blue-500" />}
              description={`Q${latestStats.quarter} ${latestStats.year}`}
              trend={latestStats.acquiredTransactions > latestStats.disposedTransactions ? "positive" : "negative"}
            />
            
            <InsightCard 
              title="Total Volume"
              value={formatLargeNumber(latestStats.totalAcquired + latestStats.totalDisposed)}
              icon={<DollarSign className="h-5 w-5 text-green-500" />}
              description="Shares traded"
              trend="neutral"
            />
            
            <InsightCard 
              title="Buy/Sell Ratio"
              value={latestStats.acquiredDisposedRatio.toFixed(2)}
              icon={latestStats.acquiredDisposedRatio >= 1 ? 
                <TrendingUp className="h-5 w-5 text-green-500" /> : 
                <TrendingDown className="h-5 w-5 text-red-500" />
              }
              description={latestStats.acquiredDisposedRatio >= 1 ? "More buying than selling" : "More selling than buying"}
              trend={latestStats.acquiredDisposedRatio >= 1 ? "positive" : "negative"}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    Buy Transactions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total purchases</span>
                      <span className="font-medium">{latestStats.totalPurchases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total shares acquired</span>
                      <span className="font-medium">{formatLargeNumber(latestStats.totalAcquired)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average transaction size</span>
                      <span className="font-medium">{formatLargeNumber(latestStats.averageAcquired)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    Sell Transactions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total sales</span>
                      <span className="font-medium">{latestStats.totalSales}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total shares disposed</span>
                      <span className="font-medium">{formatLargeNumber(latestStats.totalDisposed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average transaction size</span>
                      <span className="font-medium">{formatLargeNumber(latestStats.averageDisposed)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      <div className="text-xs text-muted-foreground italic">
        Source: SEC Form 4 filings via Financial Modeling Prep
      </div>
    </div>
  );
};

interface InsightCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, icon, description, trend }) => {
  const trendColor = trend === 'positive' 
    ? 'text-green-500' 
    : trend === 'negative' 
      ? 'text-red-500' 
      : 'text-blue-500';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${trendColor}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const formatLargeNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  
  if (isNaN(value)) return 'N/A';
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  } else {
    return value.toString();
  }
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-4 w-full" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default InsiderTradingStatsSection;
