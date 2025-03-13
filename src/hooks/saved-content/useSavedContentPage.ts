
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
  const { 
    reports, 
    isLoading: reportsLoading, 
    deleteReport, 
    fetchReports, 
    error: reportsError,
    lastError: reportsLastError,
    debugInfo: reportsDebugInfo
  } = useSavedReports();
  
  const { 
    predictions, 
    isLoading: predictionsLoading, 
    deletePrediction, 
    fetchPredictions,
    error: predictionsError,
    lastError: predictionsLastError,
    debugInfo: predictionsDebugInfo
  } = useSavedPredictions();
  
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'predictions'>('reports');

  // Refresh content when page loads
  useEffect(() => {
    if (user) {
      console.log("SavedContent component mounted, fetching content...");
      fetchReports();
      fetchPredictions();
    }
  }, [user]);

  // Update selected content when lists change
  useEffect(() => {
    // If selected report is no longer in the list, clear selection
    if (selectedReport && !reports.find(r => r.id === selectedReport.id)) {
      setSelectedReport(null);
    }
    
    // If selected prediction is no longer in the list, clear selection
    if (selectedPrediction && !predictions.find(p => p.id === selectedPrediction.id)) {
      setSelectedPrediction(null);
    }
    
    // Auto-select first item if nothing selected and we have items
    if (!selectedReport && !selectedPrediction) {
      if (activeTab === 'reports' && reports.length > 0) {
        setSelectedReport(reports[0]);
      } else if (activeTab === 'predictions' && predictions.length > 0) {
        setSelectedPrediction(predictions[0]);
      }
    }
  }, [reports, predictions, selectedReport, selectedPrediction, activeTab]);

  const isLoading = authLoading || reportsLoading || predictionsLoading;

  const handleSelectReport = (report: SavedReport) => {
    console.log("Selecting report:", report.id);
    setSelectedReport(report);
    setSelectedPrediction(null);
    setActiveTab('reports');
    
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
    setActiveTab('predictions');
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
    handleSelectReport,
    handleSelectPrediction,
    handleDeleteReport,
    handleDeletePrediction,
    handleDownloadHtml,
    handleRefresh
  };
};
