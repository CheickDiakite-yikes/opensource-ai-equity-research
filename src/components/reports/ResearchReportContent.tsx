import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, Lock } from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import ReportGeneratorForm from "./ReportGeneratorForm";
import ReportTabs from "./ReportTabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedReports, useSavedPredictions } from "@/hooks/useSavedContent";
import { useNavigate } from "react-router-dom";
import { getRemainingPredictions, hasReachedFreeLimit } from "@/services/api/userContent/freePredictionsService";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [showTip, setShowTip] = useState(true);
  const { saveReport, fetchReports } = useSavedReports();
  const { savePrediction, fetchPredictions } = useSavedPredictions();
  const [saveAttempted, setSaveAttempted] = useState(false);
  const isAuthenticated = !!user;
  const remainingPredictions = getRemainingPredictions();
  const reachedFreeLimit = hasReachedFreeLimit();
  
  // Handle saving a report
  const handleSaveReport = async () => {
    if (!user) {
      console.log("No user found, redirecting to auth page");
      toast.error("You must be signed in to save reports");
      navigate('/auth');
      return;
    }
    
    if (!report) {
      toast.error("No report to save");
      return;
    }
    
    console.log("Saving report:", report.symbol, report.companyName);
    try {
      setSaveAttempted(true);
      
      // Verify auth status before saving
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        console.error("User not authenticated when attempting to save report");
        toast.error("Authentication required. Please sign in again.");
        navigate('/auth');
        return;
      }
      
      const reportId = await saveReport(report.symbol, report.companyName, report);
      if (reportId) {
        toast.success(`Report for ${report.symbol} saved successfully`);
        console.log("Report saved with ID:", reportId);
        fetchReports(); // Refresh the reports list
      } else {
        toast.error("Failed to save report. Please try again.");
        console.error("No report ID returned from saveReport");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("An error occurred while saving the report");
    }
  };
  
  // Handle saving a prediction
  const handleSavePrediction = async () => {
    if (!user) {
      console.log("No user found, redirecting to auth page");
      toast.error("You must be signed in to save predictions");
      navigate('/auth');
      return;
    }
    
    if (!prediction) {
      toast.error("No prediction to save");
      return;
    }
    
    console.log("Saving prediction:", prediction.symbol, data.profile?.companyName || prediction.symbol);
    try {
      setSaveAttempted(true);
      
      // Verify auth status before saving
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        console.error("User not authenticated when attempting to save prediction");
        toast.error("Authentication required. Please sign in again.");
        navigate('/auth');
        return;
      }
      
      const predictionId = await savePrediction(
        prediction.symbol, 
        data.profile?.companyName || prediction.symbol, 
        prediction
      );
      
      if (predictionId) {
        toast.success(`Prediction for ${prediction.symbol} saved successfully`);
        console.log("Prediction saved with ID:", predictionId);
        fetchPredictions(); // Refresh the predictions list
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
        "This report appears to be basic. Try generating again or updating the report type.",
        { duration: 6000 }
      );
    }
  }, [isReportTooBasic, report]);

  // Auto-save report when it's generated (if user is logged in)
  useEffect(() => {
    if (user && report && !isGenerating && !saveAttempted) {
      console.log("Auto-saving newly generated report");
      handleSaveReport();
    }
  }, [report, isGenerating, user]);
  
  // Auto-save prediction when it's generated (if user is logged in)
  useEffect(() => {
    if (user && prediction && !isPredicting && !saveAttempted) {
      console.log("Auto-saving newly generated prediction");
      handleSavePrediction();
    }
  }, [prediction, isPredicting, user]);

  // Reset save attempted flag when new report/prediction is being generated
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
        <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited data available</AlertTitle>
          <AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
            We found limited financial data for this stock. The report may contain incomplete analysis.
          </AlertDescription>
        </Alert>
      )}

      {showTip && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Generate AI analysis</AlertTitle>
          <AlertDescription className="text-blue-700/80 dark:text-blue-400/80 flex justify-between items-center">
            <span>Create a detailed equity research report or price prediction by selecting an option below.</span>
            <button 
              onClick={() => setShowTip(false)} 
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert className="bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-700 dark:text-indigo-300">
          <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <AlertTitle className="text-indigo-800 dark:text-indigo-300">Premium features available</AlertTitle>
          <AlertDescription className="text-indigo-700/80 dark:text-indigo-400/80">
            <p className="mb-2">Sign in to unlock full access to research reports and unlimited price predictions.</p>
            <ul className="list-disc ml-5 text-xs space-y-1">
              <li>Create detailed research reports</li>
              <li>Get unlimited price predictions</li>
              <li>Save your reports and predictions</li>
              <li>Access saved content for 7 days</li>
            </ul>
            {remainingPredictions > 0 && (
              <p className="mt-2 text-sm font-medium">
                You have {remainingPredictions} free predictions remaining
              </p>
            )}
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

      {user ? (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-700 dark:text-green-300">
          <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">Auto-save enabled</AlertTitle>
          <AlertDescription className="text-green-700/80 dark:text-green-400/80">
            Reports and predictions will be automatically saved to your account.
          </AlertDescription>
        </Alert>
      ) : reachedFreeLimit ? (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Free prediction limit reached</AlertTitle>
          <AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
            You've used all 5 free predictions. Sign in to get unlimited predictions and reports.
          </AlertDescription>
        </Alert>
      ) : null}

      <ReportTabs report={report} prediction={prediction} />
    </div>
  );
};

export default ResearchReportContent;
