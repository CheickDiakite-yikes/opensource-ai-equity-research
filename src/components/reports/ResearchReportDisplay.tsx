
import React, { useState } from "react";
import { ResearchReport } from "@/types";
import { ReportHeader } from "./ReportHeader";
import { ReportSectionsList } from "./ReportSectionsList";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { GrowthCatalysts } from "./GrowthCatalysts";
import { DisclaimerSection } from "./DisclaimerSection";
import { downloadReportAsHTML } from "@/utils/reportDownloadUtils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ResearchReportDisplayProps {
  report: ResearchReport;
}

const ResearchReportDisplay: React.FC<ResearchReportDisplayProps> = ({ report }) => {
  const [expandedScenarios, setExpandedScenarios] = useState<string | null>(null);
  
  const toggleScenario = (scenario: string) => {
    setExpandedScenarios(prev => prev === scenario ? null : scenario);
  };
  
  const handleDownload = () => {
    downloadReportAsHTML(report);
  };
  
  // Check if there are any placeholders in the report content
  const checkForPlaceholders = () => {
    const reportString = JSON.stringify(report);
    return reportString.includes('[') && reportString.includes(']');
  };
  
  const hasPlaceholders = checkForPlaceholders();

  return (
    <div className="space-y-6">
      {hasPlaceholders && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-yellow-800">
          <p>Note: Some content in this report may contain placeholder text. This is for preview purposes only.</p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Research Report</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </div>
      
      <ReportHeader
        companyName={report.companyName}
        symbol={report.symbol}
        date={report.date}
        recommendation={report.recommendation}
        targetPrice={report.targetPrice}
        ratingDetails={report.ratingDetails}
      />
      
      {report.summary && (
        <div className="bg-muted/40 p-4 rounded-lg border border-border/60">
          <h3 className="font-semibold mb-2">Executive Summary</h3>
          <p className="text-sm text-muted-foreground">{report.summary}</p>
        </div>
      )}
      
      <ReportSectionsList 
        report={report} 
        expandedScenarios={expandedScenarios} 
        toggleScenario={toggleScenario} 
      />
      
      <DisclaimerSection />
    </div>
  );
};

export default ResearchReportDisplay;
