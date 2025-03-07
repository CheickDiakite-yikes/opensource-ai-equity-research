
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedReports, useSavedPredictions, SavedReport, SavedPrediction } from "@/hooks/useSavedContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import ReportsTabContent from "@/components/saved-content/ReportsTabContent";
import PredictionsTabContent from "@/components/saved-content/PredictionsTabContent";

const SavedContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { reports, isLoading: reportsLoading, deleteReport, fetchReports } = useSavedReports();
  const { predictions, isLoading: predictionsLoading, deletePrediction } = useSavedPredictions();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);

  // If user is not logged in, redirect to login page
  if (!user && !authLoading) {
    return <Navigate to="/auth" />;
  }

  // Refresh reports when page loads
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const isLoading = authLoading || reportsLoading || predictionsLoading;

  const handleSelectReport = (report: SavedReport) => {
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
    setSelectedPrediction(prediction);
    setSelectedReport(null);
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteReport(reportId);
    if (success && selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const handleDeletePrediction = async (predictionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Saved Content</h1>
      
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Research Reports</span>
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 w-5">
              {reports.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Price Predictions</span>
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 w-5">
              {predictions.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-6">
          <ReportsTabContent
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={handleSelectReport}
            onDeleteReport={handleDeleteReport}
            onDownloadHtml={handleDownloadHtml}
          />
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6">
          <PredictionsTabContent
            predictions={predictions}
            selectedPrediction={selectedPrediction}
            onSelectPrediction={handleSelectPrediction}
            onDeletePrediction={handleDeletePrediction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedContent;
