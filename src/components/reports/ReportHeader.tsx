
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResearchReport } from "@/types";
import { downloadReportAsHTML } from "@/utils/reportDownloadUtils";

interface ReportHeaderProps {
  report: ResearchReport;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => {
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

  const handleDownload = () => {
    downloadReportAsHTML(report);
  };

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{report.companyName} ({report.symbol})</h2>
          <p className="text-sm text-muted-foreground">Report Date: {report.date}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <FileDown className="h-4 w-4 mr-1.5" />
          Download Report
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Recommendation</span>
          <Badge 
            className={`${getRecommendationColor(report.recommendation)} px-2.5 py-1 font-semibold`}
            variant="outline"
          >
            {report.recommendation}
          </Badge>
        </div>
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Price Target</span>
          <span className="text-xl font-semibold">{report.targetPrice}</span>
        </div>
        
        {/* Rating Details if available */}
        {report.ratingDetails && (
          <div className="p-3 border rounded-lg flex-1">
            <span className="text-xs text-muted-foreground block mb-1">Rating Scale</span>
            <span className="text-sm font-medium">{report.ratingDetails.ratingScale}</span>
          </div>
        )}
      </div>
    </>
  );
};
