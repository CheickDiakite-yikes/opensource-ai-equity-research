
import React, { useState } from "react";
import { ResearchReport } from "@/types";
import { ReportHeader } from "./ReportHeader";
import { ReportSectionsList } from "./ReportSectionsList";
import { DisclaimerSection } from "./DisclaimerSection";

interface ResearchReportDisplayProps {
  report: ResearchReport;
}

const ResearchReportDisplay: React.FC<ResearchReportDisplayProps> = ({ report }) => {
  const [expandedScenarios, setExpandedScenarios] = useState<string | null>(null);
  
  // Toggle expanded scenario
  const toggleScenario = (scenario: string) => {
    if (expandedScenarios === scenario) {
      setExpandedScenarios(null);
    } else {
      setExpandedScenarios(scenario);
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Header with title, date, recommendation, etc. */}
      <ReportHeader report={report} />
      
      {/* Executive Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
        <p className="text-sm leading-relaxed">{report.summary}</p>
      </div>
      
      {/* Report Sections in collapsible format */}
      <ReportSectionsList 
        report={report} 
        expandedScenarios={expandedScenarios} 
        toggleScenario={toggleScenario} 
      />
      
      {/* Disclaimer */}
      <DisclaimerSection />
    </div>
  );
};

export default ResearchReportDisplay;
