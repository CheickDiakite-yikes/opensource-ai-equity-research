
import { Badge } from "@/components/ui/badge";

interface StockRatingIndicatorProps {
  rating: string | null;
}

const StockRatingIndicator = ({ rating }: StockRatingIndicatorProps) => {
  if (!rating) return <span className="text-muted-foreground">N/A</span>;
  
  // Normalize the rating format (in case it comes in different formats)
  const normalizedRating = rating.trim().toUpperCase()[0];
  
  // Define badge colors based on rating grade
  const getBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'B':
        return "bg-green-50 text-green-600 hover:bg-green-50";
      case 'C':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'D':
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case 'F':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
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
