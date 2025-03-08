
import { useStockOverviewData } from "@/hooks/useStockOverviewData";
import StockOverviewSkeleton from "./stock-overview/StockOverviewSkeleton";
import ErrorDisplay from "./stock-overview/ErrorDisplay";
import StockOverviewContent from "./stock-overview/StockOverviewContent";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

interface StockOverviewProps {
  symbol: string;
}

const StockOverview = ({ symbol }: StockOverviewProps) => {
  const {
    profile,
    quote,
    secFilings,
    loading,
    documentsLoading,
    error,
    rating,
    ratingSnapshot,
    gradeNews,
    ratingsLoading,
    refetch
  } = useStockOverviewData(symbol);

  // Show a toast when data fails to load but there's no critical error
  useEffect(() => {
    if (!loading && !error && (!profile || !quote)) {
      toast({
        title: "Data Loading Issue",
        description: `Some data for ${symbol} could not be loaded. Please try again later.`,
        variant: "destructive",
      });
    }
  }, [loading, error, profile, quote, symbol]);

  // Enhanced logging for debugging
  console.log("StockOverview rendering for", symbol, "with data:", { 
    hasProfile: !!profile,
    hasQuote: !!quote,
    hasRating: !!rating,
    hasRatingSnapshot: !!ratingSnapshot, 
    ratingSnapshotDetails: ratingSnapshot ? {
      rating: ratingSnapshot.rating,
      overallScore: ratingSnapshot.overallScore
    } : null,
    gradeNewsCount: gradeNews?.length || 0,
    gradeNewsFirstItem: gradeNews && gradeNews.length > 0 ? {
      company: gradeNews[0].gradingCompany,
      date: gradeNews[0].publishedDate,
      newGrade: gradeNews[0].newGrade
    } : null,
    secFilingsCount: secFilings?.length || 0,
    isMainLoading: loading,
    isRatingsLoading: ratingsLoading,
    isDocumentsLoading: documentsLoading,
    error: error
  });

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
      secFilings={secFilings}
      documentsLoading={documentsLoading}
      symbol={symbol}
      ratingSnapshot={ratingSnapshot}
      gradeNews={gradeNews}
      ratingsLoading={ratingsLoading}
    />
  );
};

export default StockOverview;
