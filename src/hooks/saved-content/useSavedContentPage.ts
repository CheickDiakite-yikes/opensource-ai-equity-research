
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useSavedReports, 
  useSavedPredictions, 
  SavedReport, 
  SavedPrediction 
} from "@/hooks/saved-content";
import { toast } from "sonner";

export const useSavedContentPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    reports, 
    isLoading: reportsLoading, 
    error: reportsError, 
    deleteReport, 
    fetchReports 
  } = useSavedReports();
  
  const { 
    predictions, 
    isLoading: predictionsLoading, 
    error: predictionsError, 
    deletePrediction, 
    fetchPredictions 
  } = useSavedPredictions();
  
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show toast for errors
  useEffect(() => {
    if (reportsError) {
      toast.error(`Error loading reports: ${reportsError}`);
    }
    if (predictionsError) {
      toast.error(`Error loading predictions: ${predictionsError}`);
    }
  }, [reportsError, predictionsError]);

  const isLoading = authLoading || reportsLoading || predictionsLoading;

  // Refresh all data manually
  const handleRefresh = useCallback(async () => {
    if (!user) {
      toast.error("You must be signed in to view saved content");
      return;
    }
    
    setIsRefreshing(true);
    console.log("Manually refreshing content...");
    try {
      await Promise.all([fetchReports(), fetchPredictions()]);
      toast.success("Content refreshed");
    } catch (error) {
      console.error("Error refreshing content:", error);
      toast.error("Failed to refresh content");
    } finally {
      setIsRefreshing(false);
    }
  }, [user, fetchReports, fetchPredictions]);

  // Log reports when they change
  useEffect(() => {
    console.log("Reports updated:", reports.length);
    reports.forEach(report => {
      console.log(`- Report ${report.id}: ${report.symbol}, HTML: ${report.html_content ? "YES" : "NO"}`);
    });

    // Clear selected report if it's no longer in the list
    if (selectedReport && !reports.some(r => r.id === selectedReport.id)) {
      setSelectedReport(null);
    }
  }, [reports, selectedReport]);

  // Log predictions when they change
  useEffect(() => {
    console.log("Predictions updated:", predictions.length);
    predictions.forEach(prediction => {
      console.log(`- Prediction ${prediction.id}: ${prediction.symbol}`);
    });

    // Clear selected prediction if it's no longer in the list
    if (selectedPrediction && !predictions.some(p => p.id === selectedPrediction.id)) {
      setSelectedPrediction(null);
    }
  }, [predictions, selectedPrediction]);

  const handleSelectReport = (report: SavedReport) => {
    console.log("Selecting report:", report.id);
    setSelectedReport(report);
    setSelectedPrediction(null);
    
    // Debug HTML content
    if (report.html_content) {
      console.log(`Report ${report.id} has HTML content of length: ${report.html_content.length}`);
    } else {
      console.warn(`Report ${report.id} has no HTML content`);
    }
  };

  const handleSelectPrediction = (prediction: SavedPrediction) => {
    console.log("Selecting prediction:", prediction.id);
    setSelectedPrediction(prediction);
    setSelectedReport(null);
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting report:", reportId);
    const success = await deleteReport(reportId);
    if (success && selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const handleDeletePrediction = async (predictionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting prediction:", predictionId);
    const success = await deletePrediction(predictionId);
    if (success && selectedPrediction?.id === predictionId) {
      setSelectedPrediction(null);
    }
  };

  const handleDownloadHtml = (report: SavedReport) => {
    if (!report.html_content) {
      toast.error("HTML content not available for this report");
      return;
    }

    // Create a Blob and download
    const blob = new Blob([report.html_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.symbol}_research_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded as HTML");
  };

  return {
    user,
    isLoading,
    isRefreshing,
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
