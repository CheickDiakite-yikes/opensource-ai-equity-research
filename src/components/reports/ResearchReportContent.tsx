
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import ReportGeneratorForm from "./ReportGeneratorForm";
import ReportTabs from "./ReportTabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedReports, useSavedPredictions } from "@/hooks/useSavedContent";

interface ResearchReportContentProps {
  data: any;
  hasStockData: boolean;
  showDataWarning: boolean;
  isGenerating: boolean;
  isPredicting: boolean;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
  reportType: string;
  setReportType: (type: string) => void;
  onGenerateReport: () => void;
  onPredictPrice: () => void;
  isReportTooBasic: boolean;
  generationError: string | null;
}

const ResearchReportContent = ({
  data,
  hasStockData,
  showDataWarning,
  isGenerating,
  isPredicting,
  report,
  prediction,
  reportType,
  setReportType,
  onGenerateReport,
  onPredictPrice,
  isReportTooBasic,
  generationError
}: ResearchReportContentProps) => {
  const { user } = useAuth();
  const [showTip, setShowTip] = useState(true);
  const { saveReport } = useSavedReports();
  const { savePrediction } = useSavedPredictions();
  
  // Handle saving a report
  const handleSaveReport = async () => {
    if (!user || !report) return;
    
    try {
      await saveReport(report.symbol, report.companyName, report);
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };
  
  // Handle saving a prediction
  const handleSavePrediction = async () => {
    if (!user || !prediction) return;
    
    try {
      await savePrediction(prediction.symbol, data.profile?.companyName || prediction.symbol, prediction);
    } catch (error) {
      console.error("Error saving prediction:", error);
    }
  };
  
  useEffect(() => {
    if (isReportTooBasic && report) {
      toast.warning(
        "This report appears to be basic. Try generating again or updating the report type.",
        { duration: 6000 }
      );
    }
  }, [isReportTooBasic, report]);

  if (!data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {showDataWarning && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited data available</AlertTitle>
          <AlertDescription className="text-amber-700/80">
            We found limited financial data for this stock. The report may contain incomplete analysis.
          </AlertDescription>
        </Alert>
      )}

      {showTip && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Generate AI analysis</AlertTitle>
          <AlertDescription className="text-blue-700/80 flex justify-between items-center">
            <span>Create a detailed equity research report or price prediction by selecting an option below.</span>
            <button 
              onClick={() => setShowTip(false)} 
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <ReportGeneratorForm
        reportType={reportType}
        setReportType={setReportType}
        onGenerateReport={onGenerateReport}
        onPredictPrice={onPredictPrice}
        isGenerating={isGenerating}
        isPredicting={isPredicting}
        hasData={hasStockData}
        onSaveReport={report ? handleSaveReport : undefined}
        onSavePrediction={prediction ? handleSavePrediction : undefined}
        canSaveReport={!!report}
        canSavePrediction={!!prediction}
      />

      {generationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error generating report</AlertTitle>
          <AlertDescription>
            {generationError}
          </AlertDescription>
        </Alert>
      )}

      <ReportTabs report={report} prediction={prediction} />
    </div>
  );
};

export default ResearchReportContent;
