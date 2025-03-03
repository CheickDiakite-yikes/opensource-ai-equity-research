
import { Badge } from "@/components/ui/badge";

interface StockRatingIndicatorProps {
  rating: string | null;
}

const StockRatingIndicator = ({ rating }: StockRatingIndicatorProps) => {
  if (!rating) return <span className="text-muted-foreground">N/A</span>;
  
  // Normalize the rating format
  const normalizedRating = rating.trim().toLowerCase();
  
  // Define badge colors based on analyst ratings
  const getBadgeVariant = (ratingValue: string) => {
    if (ratingValue.includes("buy") || ratingValue.includes("outperform") || ratingValue.includes("overweight") || ratingValue.includes("strong")) {
      return "bg-green-100 text-green-800 hover:bg-green-100";
    } else if (ratingValue.includes("hold") || ratingValue.includes("neutral") || ratingValue.includes("maintain") || ratingValue.includes("perform")) {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    } else if (ratingValue.includes("sell") || ratingValue.includes("underperform") || ratingValue.includes("underweight") || ratingValue.includes("reduce")) {
      return "bg-red-100 text-red-800 hover:bg-red-100";
    } else {
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
  };

  return (
    <Badge 
      className={`${getBadgeVariant(normalizedRating)} font-semibold px-2.5 py-1`}
      variant="outline"
    >
      {rating}
    </Badge>
  );
};

export default StockRatingIndicator;
