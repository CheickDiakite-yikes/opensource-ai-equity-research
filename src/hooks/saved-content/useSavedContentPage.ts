
import { useState, useCallback } from "react";
import { useSavedReports, SavedReport } from "./useSavedReports";
import { useSavedPredictions, SavedPrediction } from "./useSavedPredictions";
import { toast } from "sonner";
import { downloadHtmlFile } from "@/utils/reports/reportDownloadUtils";

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
    
    const filename = `${report.symbol}_research_report.html`;
    downloadHtmlFile(report.html_content, filename);
    toast.success(`Downloaded report as ${filename}`);
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
