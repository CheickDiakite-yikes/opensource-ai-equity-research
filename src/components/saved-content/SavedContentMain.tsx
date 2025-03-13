import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchReportDisplay } from "@/components/reports/ResearchReportDisplay";
import { StockPredictionDisplay } from "@/components/predictions/StockPredictionDisplay";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import DebugErrorDisplay from "./DebugErrorDisplay";
import { SavedContentError } from "@/hooks/saved-content/useSavedContentBase";

interface SavedContentMainProps {
  userEmail: string | null;
  isRefreshing: boolean;
  reports: any[];
  predictions: any[];
  selectedReport: any | null;
  selectedPrediction: any | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportsError: string | null;
  reportsLastError: SavedContentError | null;
  reportsDebugInfo: string | null;
  predictionsError: string | null;
  predictionsLastError: SavedContentError | null;
  predictionsDebugInfo: string | null;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  onRefresh: (tab: string) => Promise<void>;
  onCheckConnection?: () => Promise<void>;
  onSelectReport: (report: any) => void;
  onSelectPrediction: (prediction: any) => void;
  onDeleteReport: (reportId: string) => Promise<void>;
  onDeletePrediction: (predictionId: string) => Promise<void>;
  onDownloadHtml: (report: any) => void;
}

const SavedContentMain: React.FC<SavedContentMainProps> = ({
  userEmail,
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
  onRefresh,
  onCheckConnection,
  onSelectReport,
  onSelectPrediction,
  onDeleteReport,
  onDeletePrediction,
  onDownloadHtml,
}) => {
  
  const handleRefresh = async () => {
    await onRefresh(activeTab);
  };
  
  const handleClearErrors = () => {
    // This will be passed to DebugErrorDisplay
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Saved Content for {userEmail || "Guest User"}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="reports">Research Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="predictions">Price Predictions ({predictions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="reports">
          {reports.length === 0 ? (
            <div className="text-gray-500">No saved reports yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-md cursor-pointer hover:shadow-md transition-shadow ${
                    selectedReport?.id === report.id ? "bg-blue-50 border-blue-500" : "bg-white"
                  }`}
                  onClick={() => onSelectReport(report)}
                >
                  <h3 className="font-semibold">{report.company_name}</h3>
                  <p className="text-sm text-gray-500">
                    Symbol: {report.symbol}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="predictions">
          {predictions.length === 0 ? (
            <div className="text-gray-500">No saved predictions yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className={`p-4 border rounded-md cursor-pointer hover:shadow-md transition-shadow ${
                    selectedPrediction?.id === prediction.id ? "bg-blue-50 border-blue-500" : "bg-white"
                  }`}
                  onClick={() => onSelectPrediction(prediction)}
                >
                  <h3 className="font-semibold">{prediction.company_name}</h3>
                  <p className="text-sm text-gray-500">
                    Symbol: {prediction.symbol}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(prediction.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Display Section */}
      {selectedReport && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Selected Report</h2>
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold">{selectedReport.company_name}</h3>
              <p className="text-sm text-gray-500">Symbol: {selectedReport.symbol}</p>
            </div>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadHtml(selectedReport)}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteReport(selectedReport.id)}
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete Report
              </Button>
            </div>
          </div>
          <ResearchReportDisplay report={selectedReport.report_data} />
        </div>
      )}

      {/* Prediction Display Section */}
      {selectedPrediction && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Selected Prediction</h2>
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold">{selectedPrediction.company_name}</h3>
              <p className="text-sm text-gray-500">Symbol: {selectedPrediction.symbol}</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeletePrediction(selectedPrediction.id)}
            >
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete Prediction
            </Button>
          </div>
          <StockPredictionDisplay prediction={selectedPrediction.prediction_data} />
        </div>
      )}
    
    {/* Only update this part */}
    {activeTab === "reports" && (
      <DebugErrorDisplay 
        error={reportsError}
        lastError={reportsLastError}
        debugInfo={reportsDebugInfo}
        connectionStatus={connectionStatus}
        onRefresh={handleRefresh}
        onClear={handleClearErrors}
        onCheckConnection={onCheckConnection}
      />
    )}
    
    {activeTab === "predictions" && (
      <DebugErrorDisplay 
        error={predictionsError}
        lastError={predictionsLastError}
        debugInfo={predictionsDebugInfo}
        connectionStatus={connectionStatus}
        onRefresh={handleRefresh}
        onClear={handleClearErrors}
        onCheckConnection={onCheckConnection}
      />
    )}
    
    </div>
  );
};

export default SavedContentMain;
