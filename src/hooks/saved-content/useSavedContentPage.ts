
import { useState, useCallback } from "react";
import { useSavedReports } from "./useSavedReports";
import { useSavedPredictions } from "./useSavedPredictions";
import { toast } from "sonner";
import { testConnection } from "@/services/api/userContent/baseService";

export const useSavedContentPage = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  
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
    connectionStatus,
    fetchPredictions, 
    deletePrediction,
    clearErrors: clearPredictionsErrors 
  } = useSavedPredictions();

  const isLoading = reportsLoading || predictionsLoading;
  const isRefreshing = false; // We'll use individual refresh indicators instead

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setSelectedPrediction(null); // Clear any selected prediction
  };

  const handleSelectPrediction = (prediction) => {
    setSelectedPrediction(prediction);
    setSelectedReport(null); // Clear any selected report
  };

  const handleDeleteReport = async (reportId) => {
    const success = await deleteReport(reportId);
    if (success) {
      // If the deleted report was selected, clear the selection
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
      toast.success("Report deleted successfully");
    }
  };

  const handleDeletePrediction = async (predictionId) => {
    const success = await deletePrediction(predictionId);
    if (success) {
      // If the deleted prediction was selected, clear the selection
      if (selectedPrediction && selectedPrediction.id === predictionId) {
        setSelectedPrediction(null);
      }
      toast.success("Prediction deleted successfully");
    }
  };

  const handleDownloadHtml = (report) => {
    if (!report.html_content) {
      toast.error("No HTML content available for this report");
      return;
    }

    // Create a Blob and download
    const blob = new Blob([report.html_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.symbol}_report_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded as HTML file");
  };

  const handleRefresh = async (tab) => {
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
      const connectionStatus = await testConnection();
      
      if (connectionStatus === 'connected') {
        toast.success("Successfully connected to database");
        return true;
      } else {
        toast.error("Failed to connect to database");
        return false;
      }
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
