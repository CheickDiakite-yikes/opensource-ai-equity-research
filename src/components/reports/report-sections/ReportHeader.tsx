
import React from "react";
import { Badge } from "@/components/ui/badge";

export interface ReportHeaderProps {
  companyName: string;
  symbol: string;
  reportDate: string;
  recommendation: string;
  targetPrice: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  companyName, 
  symbol, 
  reportDate, 
  recommendation, 
  targetPrice 
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
          <p className="text-sm text-muted-foreground">Report Date: {reportDate}</p>
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
          <span className="text-xl font-semibold">{targetPrice}</span>
        </div>
      </div>
    </>
  );
};

export default ReportHeader;
