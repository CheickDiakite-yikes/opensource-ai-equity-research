
import React from "react";
import { SavedReport, SavedPrediction } from "@/hooks/saved-content";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchReportDisplay } from "@/components/reports/ResearchReportDisplay";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import DebugErrorDisplay from "./DebugErrorDisplay";

interface SavedContentMainProps {
  userEmail: string | null;
  isRefreshing: boolean;
  reports: SavedReport[];
  predictions: SavedPrediction[];
  selectedReport: SavedReport | null;
  selectedPrediction: SavedPrediction | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportsError: string | null;
  reportsLastError: string | null;
  reportsDebugInfo: any;
  predictionsError: string | null;
  predictionsLastError: string | null;
  predictionsDebugInfo: any;
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
  onRefresh: (tab?: string) => Promise<void>;
  onCheckConnection: () => Promise<boolean>;
  onSelectReport: (report: SavedReport) => void;
  onSelectPrediction: (prediction: SavedPrediction) => void;
  onDeleteReport: (reportId: string) => Promise<void>;
  onDeletePrediction: (predictionId: string) => Promise<void>;
  onDownloadHtml: (report: SavedReport) => void;
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
  onDownloadHtml
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
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-4"
      >
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
                  <p className="text-sm text-gray-500">Symbol: {report.symbol}</p>
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
                  <p className="text-sm text-gray-500">Symbol: {prediction.symbol}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(prediction.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Price</h3>
                <p className="text-2xl font-bold">${selectedPrediction.prediction_data.currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Predicted Prices</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>1 Month:</span>
                    <span className="font-medium">${selectedPrediction.prediction_data.predictedPrice.oneMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3 Months:</span>
                    <span className="font-medium">${selectedPrediction.prediction_data.predictedPrice.threeMonths.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>6 Months:</span>
                    <span className="font-medium">${selectedPrediction.prediction_data.predictedPrice.sixMonths.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Year:</span>
                    <span className="font-medium">${selectedPrediction.prediction_data.predictedPrice.oneYear.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedPrediction.prediction_data.keyDrivers && selectedPrediction.prediction_data.keyDrivers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Key Drivers</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPrediction.prediction_data.keyDrivers.map((driver, idx) => (
                    <li key={idx}>{driver}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedPrediction.prediction_data.risks && selectedPrediction.prediction_data.risks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPrediction.prediction_data.risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

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
