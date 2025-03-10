
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
  const { saveReport, fetchReports } = useSavedReports();
  const { savePrediction, fetchPredictions } = useSavedPredictions();
  const [saveAttempted, setSaveAttempted] = useState(false);
  
  const handleSaveReport = async () => {
    if (!user) {
      toast.error("You must be signed in to save reports");
      return;
    }
    
    if (!report) {
      toast.error("No report to save");
      return;
    }
    
    console.log("Saving report:", report.symbol, report.companyName);
    try {
      setSaveAttempted(true);
      const reportId = await saveReport(report.symbol, report.companyName, report);
      if (reportId) {
        toast.success(`Report for ${report.symbol} saved successfully`);
        console.log("Report saved with ID:", reportId);
        fetchReports();
      } else {
        toast.error("Failed to save report. Please try again.");
        console.error("No report ID returned from saveReport");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("An error occurred while saving the report");
    }
  };
  
  const handleSavePrediction = async () => {
    if (!user) {
      toast.error("You must be signed in to save predictions");
      return;
    }
    
    if (!prediction) {
      toast.error("No prediction to save");
      return;
    }
    
    console.log("Saving prediction:", prediction.symbol, data.profile?.companyName || prediction.symbol);
    try {
      setSaveAttempted(true);
      const predictionId = await savePrediction(
        prediction.symbol, 
        data.profile?.companyName || prediction.symbol, 
        prediction
      );
      
      if (predictionId) {
        toast.success(`Prediction for ${prediction.symbol} saved successfully`);
        console.log("Prediction saved with ID:", predictionId);
        fetchPredictions();
      } else {
        toast.error("Failed to save prediction. Please try again.");
        console.error("No prediction ID returned from savePrediction");
      }
    } catch (error) {
      console.error("Error saving prediction:", error);
      toast.error("An error occurred while saving the prediction");
    }
  };
  
  useEffect(() => {
    if (isReportTooBasic && report) {
      toast.warning(
        "This report appears to be basic. Try generating again or updating the report type."
      );
    }
  }, [isReportTooBasic, report]);

  useEffect(() => {
    if (user && report && !isGenerating && !saveAttempted) {
      console.log("Auto-saving newly generated report");
      handleSaveReport();
    }
  }, [report, isGenerating, user]);
  
  useEffect(() => {
    if (user && prediction && !isPredicting && !saveAttempted) {
      console.log("Auto-saving newly generated prediction");
      handleSavePrediction();
    }
  }, [prediction, isPredicting, user]);

  useEffect(() => {
    if (isGenerating || isPredicting) {
      setSaveAttempted(false);
    }
  }, [isGenerating, isPredicting]);

  if (!data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {showDataWarning && (
        <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
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
          <AlertDescription>{generationError}</AlertDescription>
        </Alert>
      )}

      {isReportTooBasic && report && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Report Quality Notice</AlertTitle>
          <AlertDescription>
            This report may not contain the level of detail typically found in professional equity research.
            Consider regenerating with the "comprehensive" option for more detailed analysis.
          </AlertDescription>
        </Alert>
      )}

      {user ? (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Auto-save enabled</AlertTitle>
          <AlertDescription className="text-green-700/80">
            Reports and predictions will be automatically saved to your account.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Sign in to save</AlertTitle>
          <AlertDescription className="text-blue-700/80">
            Sign in to automatically save your reports and predictions.
          </AlertDescription>
        </Alert>
      )}

      <ReportTabs report={report} prediction={prediction} />
    </div>
  );
};

export default ResearchReportContent;
