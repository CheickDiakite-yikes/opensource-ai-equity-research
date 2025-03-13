
import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorDisplay from "@/components/reports/ErrorDisplay";
import { useResearchReportData } from "@/components/reports/useResearchReportData";
import { useReportGeneration } from "@/components/reports/useReportGeneration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ResearchReportContent from "@/components/reports/ResearchReportContent";

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
    handlePredictPrice
  } = useReportGeneration(symbol, data);

  // Enhanced debugging for better report troubleshooting
  useEffect(() => {
    if (report) {
      console.log("Report data available:", {
        symbol: report.symbol,
        companyName: report.companyName,
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

  // Return loading UI during generation
  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Generating Research Report...</h2>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Show the report if it's been generated
  if (report) {
    const companyName = data?.profile?.companyName || report.companyName;
    
    return (
      <ResearchReportContent
        report={report}
        symbol={symbol}
        companyName={companyName}
      />
    );
  }

  // Show the report generation UI if no report has been generated yet
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Research Report Generator</h2>
      </div>
      
      {showDataWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Data Available</AlertTitle>
          <AlertDescription>
            Some financial data might be missing or incomplete for this company, which may affect the quality of the generated report.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate AI Research Report</h3>
        
        <Tabs defaultValue="normal" className="w-full" value={reportType} onValueChange={setReportType}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="normal">Standard Report</TabsTrigger>
            <TabsTrigger value="comprehensive">Comprehensive Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="normal" className="mt-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a standard analysis report covering key aspects of the company including fundamentals, technical indicators, and investment outlook.
            </p>
          </TabsContent>
          
          <TabsContent value="comprehensive" className="mt-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a detailed research report with in-depth analysis of financials, valuation metrics, growth prospects, risk factors, and scenario analysis.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Comprehensive reports take longer to generate but provide more detailed analysis.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1" 
            onClick={() => handleGenerateReport()} 
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Research Report"}
          </Button>
        </div>
        
        {generationError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Error</AlertTitle>
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
};

export default ResearchReportGenerator;
