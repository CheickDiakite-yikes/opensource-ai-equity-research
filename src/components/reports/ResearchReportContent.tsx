import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReportHeader from "@/components/reports/ReportHeader";
import ReportSectionsList from "@/components/reports/ReportSectionsList";
import PricePredictionDisplay from "@/components/reports/PricePredictionDisplay";
import ReportGeneratorForm from "@/components/reports/ReportGeneratorForm";
import DisclaimerSection from "@/components/reports/DisclaimerSection";
import ErrorDisplay from "@/components/reports/ErrorDisplay";
import { useAuth } from "@/hooks/auth/useAuth"; // Updated import
import { useSavedReports, useSavedPredictions } from "@/hooks/saved-content"; 
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { canGenerateMorePredictions, incrementUsedPredictions } from "@/services/api/userContent/freePredictionsService";
import { ReportData } from "@/components/reports/useResearchReportData";

export interface ResearchReportContentProps {
  isGenerating: boolean;
  isPredicting: boolean;
  report: ResearchReport | null;
  prediction: StockPrediction | null;
  reportType: string;
  setReportType: React.Dispatch<React.SetStateAction<string>>;
  onGenerateReport: () => Promise<void>;
  onPredictPrice: () => Promise<void>;
  data: ReportData;
  showDataWarning: boolean;
  hasStockData: boolean;
  // Add the missing properties
  isReportTooBasic: boolean;
  generationError: string | null;
}

const ResearchReportContent: React.FC<ResearchReportContentProps> = ({
  isGenerating,
  isPredicting,
  report,
  prediction,
  reportType,
  setReportType,
  onGenerateReport,
  onPredictPrice,
  data,
  showDataWarning,
  hasStockData,
  isReportTooBasic,
  generationError
}) => {
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const { user } = useAuth();
  const { saveReport } = useSavedReports();
  const { savePrediction } = useSavedPredictions();
  
  const canSaveReport = !!report && !saveInProgress && user;
  const canSavePrediction = !!prediction && !saveInProgress && user;

  const handleSaveReport = async () => {
    if (!report || !data.profile) {
      toast({
        title: "Error",
        description: "Cannot save report: missing report data",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be signed in to save reports",
        variant: "destructive",
      });
      return;
    }
    
    setSaveInProgress(true);
    try {
      const reportId = await saveReport(report.symbol, data.profile.companyName, report);
      if (reportId) {
        toast({
          title: "Report Saved",
          description: "Research report has been saved to your account.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save report.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save report: " + error,
        variant: "destructive",
      });
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!prediction || !data.profile) {
      toast({
        title: "Error",
        description: "Cannot save prediction: missing prediction data",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be signed in to save predictions",
        variant: "destructive",
      });
      return;
    }
    
    setSaveInProgress(true);
    try {
      const predictionId = await savePrediction(prediction.symbol, data.profile.companyName, prediction);
      if (predictionId) {
        toast({
          title: "Prediction Saved",
          description: "Price prediction has been saved to your account.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save prediction.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving prediction:", error);
      toast({
        title: "Error",
        description: "Failed to save prediction: " + error,
        variant: "destructive",
      });
    } finally {
      setSaveInProgress(false);
    }
  };
  
  const showPredictionLimitWarning = !user && !canGenerateMorePredictions();

  return (
    <div className="flex flex-col space-y-6">
      <ReportHeader symbol={data.profile?.symbol || ""} companyName={data.profile?.companyName || ""} />

      {showDataWarning && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.67-.759 1.785-.759 2.455 0l8.25 9.33a1 1 0 00-.216 1.836H19V19a2 2 0 01-2 2H3a2 2 0 01-2-2V13.66l.216-1.836 8.25-9.33zM10 5a.75.75 0 01.75.75v3.25a.75.75 0 01-1.5 0V5.75A.75.75 0 0110 5zm-7.75 8.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-.75z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Data Incompleteness</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The report may be limited due to missing financial data.
                </p>
              </div>
            </div>
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
        onSaveReport={handleSaveReport}
        onSavePrediction={handleSavePrediction}
        canSaveReport={canSaveReport}
        canSavePrediction={canSavePrediction}
      />

      {generationError && (
        <ErrorDisplay message={generationError} />
      )}

      {report && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Research Report</h2>
          {isReportTooBasic && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zM9.309 13.16a.75.75 0 101.392 1.08A2.25 2.25 0 0110 15a2.25 2.25 0 01-.691-1.84.75.75 0 00-.309-.58z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Report Quality</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This report is based on limited data. For a more comprehensive analysis, consider generating a report with more available financial data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <ReportSectionsList sections={report.sections} />
          <DisclaimerSection />
        </div>
      )}

      {prediction && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Price Prediction</h2>
          <PricePredictionDisplay prediction={prediction} />
          <DisclaimerSection />
        </div>
      )}

      {showPredictionLimitWarning && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Free Prediction Limit Reached</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You have used all your free price predictions. Sign up to unlock unlimited predictions.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => {
            incrementUsedPredictions();
            toast({
              title: "Limit Reached",
              description: "Please sign up to continue generating predictions.",
            });
          }}>
            Continue as Guest
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResearchReportContent;
