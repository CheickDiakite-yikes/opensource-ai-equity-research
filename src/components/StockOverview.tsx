
import React, { useMemo } from "react";
import { useStockOverviewData } from "@/hooks/useStockOverviewData";
import StockOverviewSkeleton from "./stock-overview/StockOverviewSkeleton";
import ErrorDisplay from "./stock-overview/ErrorDisplay";
import StockOverviewContent from "./stock-overview/StockOverviewContent";
import { useIsMobile } from "@/hooks/use-mobile";

interface StockOverviewProps {
  symbol: string;
}

const StockOverview = ({ symbol }: StockOverviewProps) => {
  const isMobile = useIsMobile();
  
  const {
    profile,
    quote,
    earningsCalls,
    secFilings,
    ownershipData,
    loading,
    documentsLoading,
    ownershipLoading,
    error,
    rating,
    refetch
  } = useStockOverviewData(symbol);

  // Memoize filtered documents for mobile
  const memoizedEarningsCalls = useMemo(() => {
    if (!earningsCalls) return [];
    // Show fewer items on mobile
    return isMobile ? earningsCalls.slice(0, 3) : earningsCalls;
  }, [earningsCalls, isMobile]);

  const memoizedSecFilings = useMemo(() => {
    if (!secFilings) return [];
    // Show fewer items on mobile
    return isMobile ? secFilings.slice(0, 5) : secFilings;
  }, [secFilings, isMobile]);

  if (loading) {
    return <StockOverviewSkeleton />;
  }

  if (error || !profile || !quote) {
    return <ErrorDisplay errorMessage={error} onRetry={refetch} />;
  }

  return (
    <StockOverviewContent
      profile={profile}
      quote={quote}
      rating={rating}
      earningsCalls={memoizedEarningsCalls}
      secFilings={memoizedSecFilings}
      ownershipData={ownershipData}
      documentsLoading={documentsLoading}
      ownershipLoading={ownershipLoading}
      symbol={symbol}
    />
  );
};

export default React.memo(StockOverview);
