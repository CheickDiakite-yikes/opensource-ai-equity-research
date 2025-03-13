
import React from "react";
import { Card } from "@/components/ui/card";

interface ReportSummaryProps {
  summary: string;
  highlights?: string[];
  recommendation: string;
  targetPrice: string;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ 
  summary, 
  highlights, 
  recommendation,
  targetPrice
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </Card>
      
      {highlights && highlights.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Investment Highlights</h3>
          <ul className="list-disc pl-5 space-y-1">
            {highlights.map((highlight, index) => (
              <li key={index} className="text-sm">{highlight}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default ReportSummary;
