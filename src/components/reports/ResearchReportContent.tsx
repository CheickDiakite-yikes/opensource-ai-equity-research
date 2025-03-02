
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import ReportGeneratorForm from "@/components/reports/ReportGeneratorForm";
import ReportTabs from "@/components/reports/ReportTabs";
import { ReportData } from "./useResearchReportData";
import { ResearchReport } from "@/types/aiAnalysisTypes";
import { StockPrediction } from "@/types/aiAnalysisTypes";

interface ResearchReportContentProps {
  data: ReportData;
  showDataWarning: boolean;
  isGenerating: boolean;
  isPredicting: boolean;
  hasStockData: boolean;
  reportType: string;
  setReportType: (value: string) => void;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
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
  onPredictPrice,
  report,
  prediction
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Research Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showDataWarning && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>Limited financial data available. Report accuracy may be affected.</p>
              </div>
            </div>
          )}
          
          <ReportGeneratorForm 
            reportType={reportType}
            setReportType={setReportType}
            onGenerateReport={onGenerateReport}
            onPredictPrice={onPredictPrice}
            isGenerating={isGenerating}
            isPredicting={isPredicting}
            hasData={hasStockData}
          />
          
          <ReportTabs report={report} prediction={prediction} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchReportContent;
