
import React, { useState } from "react";
import { ResearchReport } from "@/types";
import { ReportHeader } from "./ReportHeader";
import { ReportSectionsList } from "./ReportSectionsList";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { GrowthCatalysts } from "./GrowthCatalysts";
import { DisclaimerSection } from "./DisclaimerSection";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateReportHTML } from "@/lib/utils";

interface ResearchReportDisplayProps {
  report: ResearchReport;
  htmlContent?: string | null;
  onDownloadHtml?: () => void;
}

const ResearchReportDisplay: React.FC<ResearchReportDisplayProps> = ({ 
  report, 
  htmlContent,
  onDownloadHtml
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
    report.sections.some(section => section.content.length < 200);

  // Find financial analysis section
  const financialSection = report.sections.find(section => 
    section.title.toLowerCase().includes("financial") || 
    section.title.toLowerCase().includes("financials")
  );
  
  // Handle downloading the report if no callback provided
  const handleDownloadReport = () => {
    if (onDownloadHtml) {
      onDownloadHtml();
      return;
    }
    
    // If no html content or callback, generate it on the fly
    const htmlContent = generateReportHTML(report.companyName, createReportContent(report));
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.symbol}_research_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Create basic report content for download
  const createReportContent = (report: ResearchReport): string => {
    return `
      <h1>${report.companyName} (${report.symbol}) - Equity Research Report</h1>
      <div class="date">Date: ${report.date}</div>
      <div class="recommendation">Recommendation: ${report.recommendation}</div>
      <div class="price-target">Target Price: $${report.targetPrice}</div>
      
      <div class="summary">
        <h2>Executive Summary</h2>
        <p>${report.summary}</p>
      </div>
      
      ${report.sections.map(section => `
        <div class="section">
          <h2>${section.title}</h2>
          <p>${section.content}</p>
        </div>
      `).join('')}
    `;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Research Report
          </h2>
        </div>
        
        {/* Always show download button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadReport}
          className="flex items-center gap-1 shadow-sm hover:shadow-md transition-shadow"
        >
          <Download className="h-4 w-4" />
          <span>Download HTML</span>
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
