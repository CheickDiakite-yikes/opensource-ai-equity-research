
import { useStockOverviewData } from "@/hooks/useStockOverviewData";
import StockOverviewSkeleton from "./stock-overview/StockOverviewSkeleton";
import ErrorDisplay from "./stock-overview/ErrorDisplay";
import StockOverviewContent from "./stock-overview/StockOverviewContent";

interface StockOverviewProps {
  symbol: string;
}

const StockOverview = ({ symbol }: StockOverviewProps) => {
  const {
    profile,
    quote,
    earningsCalls,
    secFilings,
    loading,
    documentsLoading,
    error,
    rating,
    refetch
  } = useStockOverviewData(symbol);

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
      earningsCalls={earningsCalls}
      secFilings={secFilings}
      documentsLoading={documentsLoading}
      symbol={symbol}
    />
  );
};

export default StockOverview;
