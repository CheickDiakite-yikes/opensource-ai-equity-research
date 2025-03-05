
import React, { useState } from "react";
import { ResearchReport } from "@/types";
import { ReportHeader } from "./ReportHeader";
import { ReportSectionsList } from "./ReportSectionsList";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { GrowthCatalysts } from "./GrowthCatalysts";
import { DisclaimerSection } from "./DisclaimerSection";
import { downloadReportAsHTML } from "@/utils/reportDownloadUtils";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Check if report is potentially low quality
  const isLowQualityReport = 
    !report.ratingDetails || 
    !report.scenarioAnalysis || 
    !report.catalysts ||
    report.sections.some(section => section.content.length < 200);

  // Find financial analysis section
  const financialSection = report.sections.find(section => 
    section.title.toLowerCase().includes("financial") || 
    section.title.toLowerCase().includes("financials")
  );
  
  return (
    <div className="space-y-6">
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
      
      {isLowQualityReport && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Report Quality Notice</AlertTitle>
          <AlertDescription>
            This report may not contain the level of detail typically found in professional equity research.
            Consider regenerating with the "comprehensive" option for more detailed analysis.
          </AlertDescription>
        </Alert>
      )}
      
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
