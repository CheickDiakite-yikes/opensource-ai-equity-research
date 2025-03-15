
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Trash2, Download, BarChart, Clock, AlertTriangle, Loader2 } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { featuredSymbols } from "@/constants/featuredSymbols";
import { useSavedContentPage } from "@/hooks/saved-content/useSavedContentPage";

const MyDocs = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");
  
  const {
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
  } = useSavedContentPage();

  // If user is not logged in, redirect to login page
  if (!user && !authLoading) {
    return <Navigate to="/auth" />;
  }

  const renderListItem = (item: any, type: 'report' | 'prediction') => {
    const isSelected = type === 'report' 
      ? selectedReport && selectedReport.id === item.id
      : selectedPrediction && selectedPrediction.id === item.id;
    
    const date = new Date(item.created_at).toLocaleDateString();
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`border rounded-lg p-4 mb-3 cursor-pointer transition-all ${
          isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
        }`}
        onClick={() => type === 'report' ? handleSelectReport(item) : handleSelectPrediction(item)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {type === 'report' ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : (
              <BarChart className="h-5 w-5 text-primary" />
            )}
            <div>
              <div className="font-medium">{item.symbol}</div>
              <div className="text-sm text-muted-foreground">{item.company_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{date}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEmptyState = (type: 'report' | 'prediction') => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {type === 'report' ? <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" /> : <BarChart className="h-16 w-16 text-muted-foreground/30 mb-4" />}
      <h3 className="text-lg font-medium">No {type === 'report' ? 'reports' : 'predictions'} found</h3>
      <p className="text-muted-foreground mt-1 max-w-md">
        {type === 'report' 
          ? "You haven't generated any research reports yet." 
          : "You haven't generated any price predictions yet."}
      </p>
    </div>
  );

  const renderDetailView = () => {
    if (!selectedReport && !selectedPrediction) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No document selected</h3>
          <p className="text-muted-foreground mt-1">Select a document from the list to view its details</p>
        </div>
      );
    }

    if (selectedReport) {
      const report = selectedReport.report_data;
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{report.symbol} - {report.companyName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {report.recommendation}
                </span>
                <span className="text-sm text-muted-foreground">
                  Target: {report.targetPrice}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownloadHtml(selectedReport)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={(e) => handleDeleteReport(selectedReport.id, e)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{report.summary}</p>
            </CardContent>
          </Card>

          {report.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else if (selectedPrediction) {
      const prediction = selectedPrediction.prediction_data;
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{prediction.symbol}</h2>
              <div className="text-sm text-muted-foreground mt-1">
                Current Price: ${prediction.currentPrice}
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={(e) => handleDeletePrediction(selectedPrediction.id, e)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Predictions</CardTitle>
              <CardDescription>AI-generated price targets based on financial analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">1 Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${prediction.predictedPrice.oneMonth}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((prediction.predictedPrice.oneMonth / prediction.currentPrice - 1) * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">3 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${prediction.predictedPrice.threeMonths}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((prediction.predictedPrice.threeMonths / prediction.currentPrice - 1) * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">6 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${prediction.predictedPrice.sixMonths}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((prediction.predictedPrice.sixMonths / prediction.currentPrice - 1) * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">1 Year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${prediction.predictedPrice.oneYear}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((prediction.predictedPrice.oneYear / prediction.currentPrice - 1) * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 space-y-2">
                  {prediction.keyDrivers.map((driver, index) => (
                    <li key={index}>{driver}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 space-y-2">
                  {prediction.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{prediction.sentimentAnalysis}</p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Confidence Level</p>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${prediction.confidenceLevel * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {(prediction.confidenceLevel * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <>
      <AppHeader featuredSymbols={featuredSymbols} />
      
      <AnimatePresence>
        {isLoading ? (
          <div className="container py-12 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your documents...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container py-12"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                My Docs
              </h1>
              <p className="text-muted-foreground">
                View and manage your saved research reports and predictions
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Tabs defaultValue="reports" onValueChange={(value) => setActiveTab(value)}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="reports" className="flex-1">Research Reports</TabsTrigger>
                    <TabsTrigger value="predictions" className="flex-1">Price Predictions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reports" className="h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    {reports.length > 0 ? (
                      <div>
                        {reports.map(report => renderListItem(report, 'report'))}
                      </div>
                    ) : (
                      renderEmptyState('report')
                    )}
                  </TabsContent>
                  
                  <TabsContent value="predictions" className="h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    {predictions.length > 0 ? (
                      <div>
                        {predictions.map(prediction => renderListItem(prediction, 'prediction'))}
                      </div>
                    ) : (
                      renderEmptyState('prediction')
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="lg:col-span-2">
                <Card className="h-[calc(100vh-220px)] overflow-y-auto">
                  <CardContent className="p-6">
                    {renderDetailView()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MyDocs;
