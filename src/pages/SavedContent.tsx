
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useSavedReports, 
  useSavedPredictions, 
  SavedReport, 
  SavedPrediction 
} from "@/hooks/saved-content";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SavedContentHeader from "@/components/saved-content/SavedContentHeader";
import SavedContentTabs from "@/components/saved-content/SavedContentTabs";
import DebugInfo from "@/components/saved-content/DebugInfo";
import { motion, AnimatePresence } from "framer-motion";

const SavedContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { reports, isLoading: reportsLoading, deleteReport, fetchReports } = useSavedReports();
  const { predictions, isLoading: predictionsLoading, deletePrediction, fetchPredictions } = useSavedPredictions();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // If user is not logged in, redirect to login page
  if (!user && !authLoading) {
    console.log("No user logged in, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  // Refresh reports when page loads
  useEffect(() => {
    if (user) {
      console.log("SavedContent component mounted, fetching reports...");
      fetchReports();
      fetchPredictions();
    }
  }, [user]);

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
      console.log(`- Prediction ${prediction.id}: ${prediction.symbol}`);
    });
  }, [predictions]);

  const isLoading = authLoading || reportsLoading || predictionsLoading;

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

  return (
    <AnimatePresence>
      {isLoading ? (
        <motion.div 
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center min-h-screen"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { duration: 1, repeat: Infinity, ease: "linear" }
            }}
            className="relative"
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="ml-3 text-muted-foreground"
          >
            Loading content...
          </motion.span>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container max-w-7xl mx-auto py-8 px-4"
        >
          <SavedContentHeader 
            userEmail={user?.email || null}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
          
          <SavedContentTabs
            reports={reports}
            predictions={predictions}
            selectedReport={selectedReport}
            selectedPrediction={selectedPrediction}
            onSelectReport={handleSelectReport}
            onSelectPrediction={handleSelectPrediction}
            onDeleteReport={handleDeleteReport}
            onDeletePrediction={handleDeletePrediction}
            onDownloadHtml={handleDownloadHtml}
          />
          
          <DebugInfo
            userId={user?.id}
            reports={reports}
            predictionsCount={predictions.length}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SavedContent;
