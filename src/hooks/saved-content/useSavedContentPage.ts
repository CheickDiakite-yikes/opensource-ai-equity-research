
import { useState, useCallback } from "react";
import { useSavedReports, SavedReport } from "./useSavedReports";
import { useSavedPredictions, SavedPrediction } from "./useSavedPredictions";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export const useSavedContentPage = () => {
  const [activeTab, setActiveTab] = useState<string>("reports");
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);
  
  const { 
    reports, 
    isLoading: reportsLoading, 
    error: reportsError,
    lastError: reportsLastError,
    debugInfo: reportsDebugInfo,
    fetchReports, 
    deleteReport,
    clearErrors: clearReportsErrors 
  } = useSavedReports();
  
  const { 
    predictions, 
    isLoading: predictionsLoading, 
    error: predictionsError,
    lastError: predictionsLastError,
    debugInfo: predictionsDebugInfo,
    fetchPredictions, 
    deletePrediction,
    clearErrors: clearPredictionsErrors,
    connectionStatus
  } = useSavedPredictions();

  const isLoading = reportsLoading || predictionsLoading;
  const isRefreshing = false; // We'll use individual refresh indicators instead

  const handleSelectReport = (report: SavedReport) => {
    setSelectedReport(report);
    setSelectedPrediction(null); // Clear any selected prediction
  };

  const handleSelectPrediction = (prediction: SavedPrediction) => {
    setSelectedPrediction(prediction);
    setSelectedReport(null); // Clear any selected report
  };

  const handleDeleteReport = async (reportId: string) => {
    const success = await deleteReport(reportId);
    if (success) {
      // If the deleted report was selected, clear the selection
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
      toast.success("Report deleted successfully");
    }
  };

  const handleDeletePrediction = async (predictionId: string) => {
    const success = await deletePrediction(predictionId);
    if (success) {
      // If the deleted prediction was selected, clear the selection
      if (selectedPrediction && selectedPrediction.id === predictionId) {
        setSelectedPrediction(null);
      }
      toast.success("Prediction deleted successfully");
    }
  };

  const handleDownloadHtml = (report: SavedReport) => {
    if (!report.html_content) {
      toast.error("No HTML content available for this report");
      return;
    }

    const blob = new Blob([report.html_content], { type: "text/html" });
    saveAs(blob, `${report.symbol}_report_${new Date().toISOString().slice(0, 10)}.html`);
    toast.success("Report downloaded as HTML file");
  };

  const handleRefresh = async (tab?: string) => {
    const activeTabToRefresh = tab || activeTab;
    
    if (activeTabToRefresh === "reports") {
      await fetchReports();
    } else {
      await fetchPredictions();
    }
  };

  const clearErrors = useCallback(() => {
    if (activeTab === "reports") {
      clearReportsErrors();
    } else {
      clearPredictionsErrors();
    }
  }, [activeTab, clearReportsErrors, clearPredictionsErrors]);

  const checkConnection = useCallback(async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        toast.error("Failed to connect to database: " + error.message);
        return false;
      }
      
      toast.success("Successfully connected to database");
      return true;
    } catch (err) {
      toast.error("Connection check failed: " + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, []);

  return {
    isLoading,
    isRefreshing,
    reports,
    predictions,
    selectedReport,
    selectedPrediction,
    activeTab,
    setActiveTab,
    reportsError,
    reportsLastError,
    reportsDebugInfo,
    predictionsError,
    predictionsLastError,
    predictionsDebugInfo,
    connectionStatus,
    handleSelectReport,
    handleSelectPrediction,
    handleDeleteReport,
    handleDeletePrediction,
    handleDownloadHtml,
    handleRefresh,
    clearErrors,
    checkConnection
  };
};
