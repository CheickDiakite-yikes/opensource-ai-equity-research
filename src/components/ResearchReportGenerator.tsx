
import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorDisplay from "@/components/reports/ErrorDisplay";
import ResearchReportContent from "@/components/reports/ResearchReportContent";
import { useResearchReportData } from "@/components/reports/useResearchReportData";
import { useReportGeneration } from "@/components/reports/useReportGeneration";

interface ResearchReportGeneratorProps {
  symbol: string;
}

const ResearchReportGenerator = ({ symbol }: ResearchReportGeneratorProps) => {
  const { 
    isLoading, 
    data, 
    error, 
    hasStockData, 
    showDataWarning 
  } = useResearchReportData(symbol);

  const {
    isGenerating,
    isPredicting,
    report,
    prediction,
    reportType,
    generationError,
    setReportType,
    handleGenerateReport,
    handleRegenerateReport,
    handlePredictPrice
  } = useReportGeneration(symbol, data);

  // Enhanced debugging for better report troubleshooting
  useEffect(() => {
    if (report) {
      console.log("Report data available:", {
        symbol: report.symbol,
        companyName: report.companyName,
        recommendation: report.recommendation,
        targetPrice: report.targetPrice,
        hasRatingDetails: !!report.ratingDetails,
        hasScenarioAnalysis: !!report.scenarioAnalysis,
        hasCatalysts: !!report.catalysts,
        sections: report.sections.map(s => s.title),
        sectionCount: report.sections.length,
        sectionSizes: report.sections.map(s => s.content.length),
        summaryLength: report.summary?.length || 0
      });
    }
  }, [report]);

  // Check for report quality issues
  const isReportTooBasic = report && (
    !report.ratingDetails || 
    !report.scenarioAnalysis || 
    !report.catalysts ||
    report.sections.length < 4 ||
    report.sections.some(s => s.content.length < 300) ||
    (report.summary && report.summary.length < 150)
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <ResearchReportContent
      data={data}
      showDataWarning={showDataWarning}
      isGenerating={isGenerating}
      isPredicting={isPredicting}
      hasStockData={hasStockData}
      reportType={reportType}
      setReportType={setReportType}
      onGenerateReport={handleGenerateReport}
      onRegenerateReport={handleRegenerateReport}
      onPredictPrice={handlePredictPrice}
      report={report}
      prediction={prediction}
      isReportTooBasic={isReportTooBasic}
      generationError={generationError}
    />
  );
};

export default ResearchReportGenerator;
