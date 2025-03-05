
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
    setReportType,
    handleGenerateReport,
    handlePredictPrice
  } = useReportGeneration(symbol, data);

  // Debug report structure if available
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
        sectionCount: report.sections.length
      });
    }
  }, [report]);

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
      onPredictPrice={handlePredictPrice}
      report={report}
      prediction={prediction}
    />
  );
};

export default ResearchReportGenerator;
