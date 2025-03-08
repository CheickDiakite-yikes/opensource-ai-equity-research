
import { RatingSnapshot } from "@/types/ratings/ratingTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface RatingsSnapshotSectionProps {
  ratingSnapshot: RatingSnapshot | null;
  isLoading: boolean;
}

const RatingsSnapshotSection = ({ ratingSnapshot, isLoading }: RatingsSnapshotSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!ratingSnapshot) {
    return null;
  }

  // Map score to a more human-readable label
  const getScoreLabel = (score: number) => {
    if (score >= 5) return "Excellent";
    if (score >= 4) return "Very Good";
    if (score >= 3) return "Good";
    if (score >= 2) return "Fair";
    return "Poor";
  };

  // Map score to a color
  const getScoreColor = (score: number) => {
    if (score >= 5) return "bg-green-500";
    if (score >= 4) return "bg-green-400";
    if (score >= 3) return "bg-yellow-400";
    if (score >= 2) return "bg-orange-400";
    return "bg-red-500";
  };

  // Calculate percentage for progress bar
  const getScorePercentage = (score: number) => {
    return (score / 5) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>Ratings Snapshot</span>
          <span className={`text-sm rounded-full px-2 py-0.5 ${
            ratingSnapshot.rating === 'A' || ratingSnapshot.rating === 'A+' || ratingSnapshot.rating === 'A-' ? 'bg-green-100 text-green-800' :
            ratingSnapshot.rating === 'B' || ratingSnapshot.rating === 'B+' || ratingSnapshot.rating === 'B-' ? 'bg-blue-100 text-blue-800' :
            ratingSnapshot.rating === 'C' || ratingSnapshot.rating === 'C+' || ratingSnapshot.rating === 'C-' ? 'bg-yellow-100 text-yellow-800' :
            ratingSnapshot.rating === 'D' || ratingSnapshot.rating === 'D+' || ratingSnapshot.rating === 'D-' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            Rating: {ratingSnapshot.rating}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-sm font-medium">{getScoreLabel(ratingSnapshot.overallScore)}</span>
              </div>
              <Progress 
                value={getScorePercentage(ratingSnapshot.overallScore)} 
                className={getScoreColor(ratingSnapshot.overallScore)} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">DCF Score</span>
                <span className="text-sm font-medium">{getScoreLabel(ratingSnapshot.discountedCashFlowScore)}</span>
              </div>
              <Progress 
                value={getScorePercentage(ratingSnapshot.discountedCashFlowScore)} 
                className={getScoreColor(ratingSnapshot.discountedCashFlowScore)} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">ROE Score</span>
                <span className="text-sm font-medium">{getScoreLabel(ratingSnapshot.returnOnEquityScore)}</span>
              </div>
              <Progress 
                value={getScorePercentage(ratingSnapshot.returnOnEquityScore)} 
                className={getScoreColor(ratingSnapshot.returnOnEquityScore)} 
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">ROA Score</span>
                <span className="text-sm font-medium">{getScoreLabel(ratingSnapshot.returnOnAssetsScore)}</span>
              </div>
              <Progress 
                value={getScorePercentage(ratingSnapshot.returnOnAssetsScore)} 
                className={getScoreColor(ratingSnapshot.returnOnAssetsScore)} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Debt to Equity</span>
                <span className="text-sm font-medium">{getScoreLabel(ratingSnapshot.debtToEquityScore)}</span>
              </div>
              <Progress 
                value={getScorePercentage(ratingSnapshot.debtToEquityScore)} 
                className={getScoreColor(ratingSnapshot.debtToEquityScore)} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">P/E Score</span>
                <span className="text-sm font-medium">{getScoreLabel(ratingSnapshot.priceToEarningsScore)}</span>
              </div>
              <Progress 
                value={getScorePercentage(ratingSnapshot.priceToEarningsScore)} 
                className={getScoreColor(ratingSnapshot.priceToEarningsScore)} 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingsSnapshotSection;
