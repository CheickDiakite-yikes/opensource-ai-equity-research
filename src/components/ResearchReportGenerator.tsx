
import React, { useEffect } from "react";
import { ResearchReportContent } from "./reports";
import { useReportGeneration } from "./reports/useReportGeneration";
import { useResearchReportData } from "./reports/useResearchReportData";

interface ResearchReportGeneratorProps {
  symbol: string;
}

const ResearchReportGenerator: React.FC<ResearchReportGeneratorProps> = ({ symbol }) => {
  const { data, isLoading, error, showDataWarning } = useResearchReportData(symbol);
  
  const { 
    isGenerating, 
    isPredicting, 
    report, 
    prediction, 
    reportType, 
    generationError, // Make sure we include this property
    setReportType, 
    handleGenerateReport, 
    handlePredictPrice 
  } = useReportGeneration(symbol, data);

  const hasStockData = !!data.quote && !!data.profile;
  const isReportTooBasic = report?.sections?.length === 1; // Added for the missing prop

  useEffect(() => {
    // Reset the component state when the symbol changes
    console.log("Symbol changed to:", symbol);
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold text-destructive mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <ResearchReportContent
      isGenerating={isGenerating}
      isPredicting={isPredicting}
      report={report}
      prediction={prediction}
      reportType={reportType}
      setReportType={setReportType}
      onGenerateReport={handleGenerateReport}
      onPredictPrice={handlePredictPrice}
      data={data}
      showDataWarning={showDataWarning}
      hasStockData={hasStockData}
      isReportTooBasic={isReportTooBasic} // Added missing prop
      generationError={generationError} // Added missing prop
    />
  );
};

export default ResearchReportGenerator;
