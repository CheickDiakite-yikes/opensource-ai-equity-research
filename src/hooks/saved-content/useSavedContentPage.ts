import { useState, useEffect } from "react";
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
  const { reports, isLoading: reportsLoading, deleteReport, fetchReports } = useSavedReports();
  const { predictions, isLoading: predictionsLoading, deletePrediction, fetchPredictions } = useSavedPredictions();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In development mode with RLS disabled, we'll fetch content regardless of user state
  useEffect(() => {
    console.log("SavedContent component mounted, fetching content (RLS disabled)...");
    if (user) {
      console.log("Current user:", user);
    } else {
      console.log("No user logged in, but continuing with dev mode");
    }
    
    fetchReports();
    fetchPredictions();
  }, []);

  // Log reports when they change
  useEffect(() => {
    console.log("Reports updated:", reports.length);
    reports.forEach(report => {
      console.log(`- Report ${report.id}: ${report.symbol}, HTML: ${report.html_content ? "YES" : "NO"}`);
    });
  }, [reports]);

  // Log predictions when they change
  useEffect(() => {
    console.log("Predictions updated:", predictions.length);
    predictions.forEach(prediction => {
      console.log(`- Prediction ${prediction.id}: ${prediction.symbol}, ${prediction.company_name}`);
    });
  }, [predictions]);

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
    console.log("Prediction data:", prediction.prediction_data);
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

  const handleRefresh = async () => {
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
  };

  return {
    user,
    isLoading: authLoading || reportsLoading || predictionsLoading,
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
