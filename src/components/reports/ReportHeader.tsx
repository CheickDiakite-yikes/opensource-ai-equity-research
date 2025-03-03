
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResearchReport } from "@/types/aiAnalysisTypes";

// Update the interface to match the props being passed
export interface ReportHeaderProps {
  companyName: string;
  symbol: string;
  date: string;
  recommendation: string;
  targetPrice: number;
  ratingDetails?: {
    ratingScale: string;
    ratingJustification?: string;
  };
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  companyName, 
  symbol, 
  date, 
  recommendation, 
  targetPrice, 
  ratingDetails 
}) => {
  // Function to determine badge color based on recommendation
  const getRecommendationColor = (recommendation: string) => {
    const rec = recommendation.toLowerCase();
    if (rec.includes('buy') || rec.includes('strong') || rec.includes('outperform')) {
      return "bg-green-100 text-green-800";
    } else if (rec.includes('hold') || rec.includes('neutral')) {
      return "bg-yellow-100 text-yellow-800";
    } else if (rec.includes('sell') || rec.includes('underperform')) {
      return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{companyName} ({symbol})</h2>
          <p className="text-sm text-muted-foreground">Report Date: {date}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Recommendation</span>
          <Badge 
            className={`${getRecommendationColor(recommendation)} px-2.5 py-1 font-semibold`}
            variant="outline"
          >
            {recommendation}
          </Badge>
        </div>
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Price Target</span>
          <span className="text-xl font-semibold">${targetPrice.toFixed(2)}</span>
        </div>
        
        {/* Rating Details if available */}
        {ratingDetails && (
          <div className="p-3 border rounded-lg flex-1">
            <span className="text-xs text-muted-foreground block mb-1">Rating Scale</span>
            <span className="text-sm font-medium">{ratingDetails.ratingScale}</span>
          </div>
        )}
      </div>
    </>
  );
};
