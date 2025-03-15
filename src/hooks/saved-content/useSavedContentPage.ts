
import { useState, useCallback } from "react";
import { useSavedReports, SavedReport } from "./useSavedReports";
import { useSavedPredictions, SavedPrediction } from "./useSavedPredictions";
import { toast } from "sonner";
import { downloadReportAsHTML } from "@/utils/reports/reportDownloadUtils";

export const useSavedContentPage = () => {
  const { reports, isLoading: reportsLoading, isRefreshing: reportsRefreshing, error: reportsError, fetchReports, deleteReport } = useSavedReports();
  const { predictions, isLoading: predictionsLoading, isRefreshing: predictionsRefreshing, error: predictionsError, fetchPredictions, deletePrediction } = useSavedPredictions();
  
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);

  const isLoading = reportsLoading || predictionsLoading;
  const isRefreshing = reportsRefreshing || predictionsRefreshing;
  const error = reportsError || predictionsError;

  const handleSelectReport = (report: SavedReport) => {
    setSelectedReport(report);
    setSelectedPrediction(null);
  };

  const handleSelectPrediction = (prediction: SavedPrediction) => {
    setSelectedPrediction(prediction);
    setSelectedReport(null);
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this report?")) {
      const success = await deleteReport(reportId);
      
      if (success) {
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(null);
        }
      }
    }
  };

  const handleDeletePrediction = async (predictionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this prediction?")) {
      const success = await deletePrediction(predictionId);
      
      if (success) {
        if (selectedPrediction && selectedPrediction.id === predictionId) {
          setSelectedPrediction(null);
        }
      }
    }
  };

  const handleDownloadHtml = (report: SavedReport) => {
    if (!report.html_content) {
      toast.error("HTML content is not available for this report");
      return;
    }
    
    // Create a complete ResearchReport object with all required properties
    const tempReport = {
      symbol: report.symbol,
      companyName: report.company_name,
      date: report.report_data?.date || new Date().toISOString().split('T')[0],
      recommendation: report.report_data?.recommendation || "N/A",
      targetPrice: report.report_data?.targetPrice || "N/A",
      summary: report.report_data?.summary || "N/A",
      sections: report.report_data?.sections || [],
      html_content: report.html_content,
      // Include optional properties if they exist in the report_data
      ratingDetails: report.report_data?.ratingDetails,
      scenarioAnalysis: report.report_data?.scenarioAnalysis,
      catalysts: report.report_data?.catalysts
    };
    
    downloadReportAsHTML(tempReport);
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    toast.info("Refreshing saved content...");
    await Promise.all([fetchReports(), fetchPredictions()]);
    toast.success("Content refreshed successfully");
  }, [fetchReports, fetchPredictions, isRefreshing]);

  return {
    isLoading,
    isRefreshing,
    error,
    reports,
    predictions,
    selectedReport,
    selectedPrediction,
    handleSelectReport,
    handleSelectPrediction,
    handleDeleteReport,
    handleDeletePrediction,
    handleDownloadHtml,
    handleRefresh
  };
};
