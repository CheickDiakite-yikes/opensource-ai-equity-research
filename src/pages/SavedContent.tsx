
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useSavedReports, 
  useSavedPredictions, 
  SavedReport, 
  SavedPrediction 
} from "@/hooks/saved-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ReportsTabContent from "@/components/saved-content/ReportsTabContent";
import PredictionsTabContent from "@/components/saved-content/PredictionsTabContent";
import { Button } from "@/components/ui/button";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Saved Content</h1>
          <p className="text-muted-foreground mt-1">Your research reports and price predictions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          
          {user && (
            <div className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <span>Logged in as: {user.email}</span>
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger 
            value="reports" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
          >
            <FileText className="h-4 w-4" />
            <span>Research Reports</span>
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 w-5">
              {reports.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="predictions" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Price Predictions</span>
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 w-5">
              {predictions.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-6 animate-fade-in">
          <ReportsTabContent
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={handleSelectReport}
            onDeleteReport={handleDeleteReport}
            onDownloadHtml={handleDownloadHtml}
          />
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6 animate-fade-in">
          <PredictionsTabContent
            predictions={predictions}
            selectedPrediction={selectedPrediction}
            onSelectPrediction={handleSelectPrediction}
            onDeletePrediction={handleDeletePrediction}
          />
        </TabsContent>
      </Tabs>
      
      {/* Debug information (only in development) */}
      {import.meta.env.DEV && (
        <div className="mt-10 p-4 border rounded bg-gray-50 text-xs font-mono">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <div>User ID: {user?.id || 'Not logged in'}</div>
          <div>Reports: {reports.length}</div>
          <div>Predictions: {predictions.length}</div>
          {reports.length > 0 && (
            <div className="mt-1">
              <div>First report: {reports[0].id} - {reports[0].symbol}</div>
              <div>HTML content: {reports[0].html_content ? 'YES' : 'NO'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedContent;
