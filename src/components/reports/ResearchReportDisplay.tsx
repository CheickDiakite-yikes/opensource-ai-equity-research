
import React, { useState } from "react";
import { ResearchReport } from "@/types";
import { ReportHeader } from "./ReportHeader";
import { ReportSectionsList } from "./ReportSectionsList";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { GrowthCatalysts } from "./GrowthCatalysts";
import { DisclaimerSection } from "./DisclaimerSection";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, FileText, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResearchReportDisplayProps {
  report: ResearchReport;
  htmlContent?: string | null;
  onDownloadHtml?: () => void;
  onRegenerate?: () => void;
}

const ResearchReportDisplay: React.FC<ResearchReportDisplayProps> = ({ 
  report, 
  htmlContent,
  onDownloadHtml,
  onRegenerate
}) => {
  const [expandedScenarios, setExpandedScenarios] = useState<string | null>(null);
  
  const toggleScenario = (scenario: string) => {
    setExpandedScenarios(prev => prev === scenario ? null : scenario);
  };

  // Check if report is potentially low quality
  const isLowQualityReport = 
    !report.ratingDetails || 
    !report.scenarioAnalysis || 
    !report.catalysts ||
    report.sections.length < 3 ||
    report.sections.some(section => section.content.length < 200);

  // Count major sections to see if we're missing any
  const expectedSections = ["investment thesis", "business overview", "financial analysis", "valuation", "risk factors"];
  const missingMajorSections = expectedSections.filter(expected => 
    !report.sections.some(section => section.title.toLowerCase().includes(expected))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Research Report
          </h2>
        </div>
        
        <div className="flex gap-2">
          {onRegenerate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRegenerate}
              className="flex items-center gap-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Regenerate</span>
            </Button>
          )}
          
          {htmlContent && onDownloadHtml && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownloadHtml}
              className="flex items-center gap-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <Download className="h-4 w-4" />
              <span>Download HTML</span>
            </Button>
          )}
        </div>
      </div>
      
      {isLowQualityReport && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Report Quality Notice</AlertTitle>
          <AlertDescription>
            This report {missingMajorSections.length > 0 ? `is missing key sections (${missingMajorSections.join(', ')}) and` : ''} may not contain the level of detail typically found in professional equity research.
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
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10 shadow-sm">
          <h3 className="font-semibold mb-2 text-primary/90">Executive Summary</h3>
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
