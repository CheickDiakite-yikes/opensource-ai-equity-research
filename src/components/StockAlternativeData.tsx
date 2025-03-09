
import React from 'react';
import { useAlternativeData } from '@/hooks/useAlternativeData';
import AlternativeDataTabs from './alternative/AlternativeDataTabs';
import { Skeleton } from '@/components/ui/skeleton';

interface StockAlternativeDataProps {
  symbol: string;
}

const StockAlternativeData: React.FC<StockAlternativeDataProps> = ({ symbol }) => {
  const { 
    companyNews, 
    socialSentiment, 
    congressionalTrading, 
    loading, 
    error, 
    isLoading,
    refetch 
  } = useAlternativeData(symbol);

  // Initial loading state (all data)
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AlternativeDataTabs
        companyNews={companyNews}
        socialSentiment={socialSentiment}
        congressionalTrading={congressionalTrading}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default StockAlternativeData;
