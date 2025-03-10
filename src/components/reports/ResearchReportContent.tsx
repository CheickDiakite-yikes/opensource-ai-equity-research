
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, AlertCircle, FileText, PieChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorDisplay from "@/components/reports/ErrorDisplay";
import ResearchReportDisplay from "@/components/reports/ResearchReportDisplay";
import { saveResearchReport } from "@/services/api/userContent/reportService";
import { downloadHtmlContent } from "@/utils/fileUtils";

import type { ResearchReport } from "@/types/ai-analysis/reportTypes";
import type { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import type { ReportData } from "./useResearchReportData";

interface ResearchReportContentProps {
  data: ReportData;
  showDataWarning: boolean;
  isGenerating: boolean;
  isPredicting: boolean;
  hasStockData: boolean;
  reportType: string;
  setReportType: (type: string) => void;
  onGenerateReport: () => void;
  onRegenerateReport?: () => void;
  onPredictPrice: () => void;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
  isReportTooBasic?: boolean;
  generationError: string | null;
}

const ResearchReportContent: React.FC<ResearchReportContentProps> = ({
  data,
  showDataWarning,
  isGenerating,
  isPredicting,
  hasStockData,
  reportType,
  setReportType,
  onGenerateReport,
  onRegenerateReport,
  onPredictPrice,
  report,
  prediction,
  isReportTooBasic,
  generationError
}) => {
  const [activeTab, setActiveTab] = useState<string>("report");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  // Handle saving the report
  const handleSaveReport = async () => {
    if (!report) return;
    
    setSaveStatus("saving");
    try {
      const reportId = await saveResearchReport(report.symbol, report.companyName, report);
      if (reportId) {
        setSaveStatus("saved");
        // If HTML content was generated, save it
        const response = await fetch(`/api/reports/html?symbol=${report.symbol}`);
        if (response.ok) {
          const html = await response.text();
          setHtmlContent(html);
        }
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      setSaveStatus("error");
    }
  };

  // Handle HTML download
  const handleDownloadHtml = () => {
    if (!report || !htmlContent) return;
    
    const filename = `${report.symbol}_research_report_${new Date().toISOString().split('T')[0]}.html`;
    downloadHtmlContent(htmlContent, filename);
  };

  // Show warning for limited data
  const dataWarning = showDataWarning && (
    <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Limited Financial Data</AlertTitle>
      <AlertDescription>
        Some financial data may be limited or unavailable for this company, which could affect the quality of the generated report.
      </AlertDescription>
    </Alert>
  );

  // Controls for report generation
  const reportControls = (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-start md:items-end">
      <div className="w-full md:w-64">
        <label className="block text-sm font-medium mb-1">Report Type</label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comprehensive">Comprehensive</SelectItem>
            <SelectItem value="financial">Financial Focus</SelectItem>
            <SelectItem value="valuation">Valuation Focus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={onGenerateReport} 
        disabled={isGenerating || !hasStockData}
        className="w-full md:w-auto"
      >
        <FileText className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating..." : "Generate Report"}
      </Button>
      
      <Button 
        onClick={onPredictPrice} 
        variant="outline" 
        disabled={isPredicting || !hasStockData}
        className="w-full md:w-auto"
      >
        <LineChart className="mr-2 h-4 w-4" />
        {isPredicting ? "Analyzing..." : "Predict Price"}
      </Button>
    </div>
  );

  // When a report is generated
  const reportDisplay = report && (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="text-lg font-semibold">{report.companyName} ({report.symbol}) Research Report</h3>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveReport}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save Report"}
          </Button>
        </div>
      </div>
      
      <ResearchReportDisplay 
        report={report} 
        htmlContent={htmlContent} 
        onDownloadHtml={htmlContent ? handleDownloadHtml : undefined} 
        onRegenerate={onRegenerateReport}
      />
    </div>
  );

  // Handle generation error
  const errorContent = generationError && (
    <ErrorDisplay error={generationError} />
  );

  return (
    <Tabs defaultValue="report" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="report">
          <FileText className="mr-2 h-4 w-4" />
          Research Report
        </TabsTrigger>
        <TabsTrigger value="prediction">
          <LineChart className="mr-2 h-4 w-4" />
          Price Prediction
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="report" className="pt-4">
        {dataWarning}
        {reportControls}
        {isGenerating ? <LoadingSkeleton /> : errorContent || reportDisplay}
      </TabsContent>
      
      <TabsContent value="prediction" className="pt-4">
        {dataWarning}
        <div className="flex justify-end">
          <Button 
            onClick={onPredictPrice} 
            disabled={isPredicting || !hasStockData}
          >
            <PieChart className="mr-2 h-4 w-4" />
            {isPredicting ? "Analyzing..." : "Generate Prediction"}
          </Button>
        </div>
        
        {isPredicting ? (
          <LoadingSkeleton />
        ) : prediction ? (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">AI Price Prediction for {prediction.symbol}</h3>
            {/* Prediction display content would go here */}
            <div className="border rounded-lg p-4">
              <p>Prediction content would be displayed here</p>
            </div>
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
};

export default ResearchReportContent;
