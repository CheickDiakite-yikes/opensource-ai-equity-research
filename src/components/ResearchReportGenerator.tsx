
import { useState } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorDisplay from "@/components/reports/ErrorDisplay";
import ResearchReportContent from "@/components/reports/ResearchReportContent";
import { useResearchReportData } from "@/components/reports/useResearchReportData";
import { useReportGeneration, ReportType } from "@/components/reports/useReportGeneration";

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

  // Add state for isReportTooBasic and generationError
  const [isReportTooBasic] = useState(false); // Default to false
  const [generationError] = useState<string | null>(null); // Default to null

  // Debug report structure if available
  if (report) {
    console.log("Report data available:", {
      hasRatingDetails: !!report.ratingDetails,
      hasScenarioAnalysis: !!report.scenarioAnalysis,
      hasCatalysts: !!report.catalysts,
      sections: report.sections.map(s => s.title)
    });
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Create a wrapper function to handle the type conversion
  const handleReportTypeChange = (value: string) => {
    setReportType(value as ReportType);
  };

  return (
    <ResearchReportContent
      data={data}
      showDataWarning={showDataWarning}
      isGenerating={isGenerating}
      isPredicting={isPredicting}
      hasStockData={hasStockData}
      reportType={reportType}
      setReportType={handleReportTypeChange}
      onGenerateReport={handleGenerateReport}
      onPredictPrice={handlePredictPrice}
      report={report}
      prediction={prediction}
      isReportTooBasic={isReportTooBasic}
      generationError={generationError}
    />
  );
};

export default ResearchReportGenerator;
