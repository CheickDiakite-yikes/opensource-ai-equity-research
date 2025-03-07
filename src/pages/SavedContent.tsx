
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedReports, useSavedPredictions, SavedReport, SavedPrediction } from "@/hooks/useSavedContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ResearchReportDisplay from "@/components/reports/ResearchReportDisplay";
import PricePredictionDisplay from "@/components/reports/PricePredictionDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { Loader2, FileText, TrendingUp, Clock, Trash2, Search, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";

const SavedContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { reports, isLoading: reportsLoading, deleteReport } = useSavedReports();
  const { predictions, isLoading: predictionsLoading, deletePrediction } = useSavedPredictions();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);

  // If user is not logged in, redirect to login page
  if (!user && !authLoading) {
    return <Navigate to="/auth" />;
  }

  const isLoading = authLoading || reportsLoading || predictionsLoading;

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
          {reports.length === 0 ? (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertTitle>No saved reports</AlertTitle>
              <AlertDescription>
                You haven't saved any research reports yet. Generate and save a report to see it here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                <h2 className="text-xl font-medium">Your Reports</h2>
                
                <div className="space-y-3">
                  {reports.map((report) => (
                    <Card 
                      key={report.id} 
                      className={`cursor-pointer hover:border-primary/50 transition-colors ${
                        selectedReport?.id === report.id ? 'border-primary' : ''
                      }`}
                      onClick={() => handleSelectReport(report)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{report.symbol}</CardTitle>
                            <CardDescription className="text-xs line-clamp-1">
                              {report.company_name}
                            </CardDescription>
                          </div>
                          <div className="flex">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-full hover:bg-primary/10 text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadHtml(report);
                              }}
                              title="Download HTML"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                              onClick={(e) => handleDeleteReport(report.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <div className="text-xs text-muted-foreground flex items-center mt-1 gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Saved {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <div className="w-full flex justify-between items-center">
                          <div className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                            {report.report_data.recommendation}
                          </div>
                          <div className="text-xs font-medium">
                            Target: ${report.report_data.targetPrice}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/20 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                  <p>
                    Reports are automatically deleted after 7 days. You can save a maximum of 10 reports.
                  </p>
                </div>
              </div>
              
              <div className="col-span-1 lg:col-span-2">
                {selectedReport ? (
                  <Card className="p-4 h-full">
                    <div className="flex justify-end mb-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadHtml(selectedReport)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download HTML</span>
                      </Button>
                    </div>
                    <ResearchReportDisplay report={selectedReport.report_data} />
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full p-12 border rounded-lg border-dashed text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-medium">Select a report</h3>
                      <p className="text-sm max-w-md mx-auto mt-2">
                        Click on a report from the list to view its details here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6">
          {predictions.length === 0 ? (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertTitle>No saved predictions</AlertTitle>
              <AlertDescription>
                You haven't saved any price predictions yet. Generate and save a prediction to see it here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                <h2 className="text-xl font-medium">Your Predictions</h2>
                
                <div className="space-y-3">
                  {predictions.map((prediction) => (
                    <Card 
                      key={prediction.id} 
                      className={`cursor-pointer hover:border-primary/50 transition-colors ${
                        selectedPrediction?.id === prediction.id ? 'border-primary' : ''
                      }`}
                      onClick={() => handleSelectPrediction(prediction)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{prediction.symbol}</CardTitle>
                            <CardDescription className="text-xs line-clamp-1">
                              {prediction.company_name}
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeletePrediction(prediction.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <div className="text-xs text-muted-foreground flex items-center mt-1 gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Saved {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <div className="w-full flex justify-between items-center text-xs">
                          <div className="font-medium">
                            Current: ${prediction.prediction_data.currentPrice.toFixed(2)}
                          </div>
                          <div className={`font-medium ${
                            prediction.prediction_data.predictedPrice.oneYear > prediction.prediction_data.currentPrice 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            1Y: ${prediction.prediction_data.predictedPrice.oneYear.toFixed(2)}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/20 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                  <p>
                    Predictions are automatically deleted after 7 days. You can save a maximum of 10 predictions.
                  </p>
                </div>
              </div>
              
              <div className="col-span-1 lg:col-span-2">
                {selectedPrediction ? (
                  <Card className="p-4">
                    <PricePredictionDisplay prediction={selectedPrediction.prediction_data} />
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full p-12 border rounded-lg border-dashed text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-medium">Select a prediction</h3>
                      <p className="text-sm max-w-md mx-auto mt-2">
                        Click on a prediction from the list to view its details here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedContent;
