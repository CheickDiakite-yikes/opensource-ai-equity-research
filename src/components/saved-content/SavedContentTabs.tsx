
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp } from "lucide-react";
import { SavedReport, SavedPrediction } from "@/hooks/saved-content";
import ReportsTabContent from "./ReportsTabContent";
import PredictionsTabContent from "./PredictionsTabContent";

interface SavedContentTabsProps {
  reports: SavedReport[];
  predictions: SavedPrediction[];
  selectedReport: SavedReport | null;
  selectedPrediction: SavedPrediction | null;
  onSelectReport: (report: SavedReport) => void;
  onSelectPrediction: (prediction: SavedPrediction) => void;
  onDeleteReport: (reportId: string, e: React.MouseEvent) => Promise<void>;
  onDeletePrediction: (predictionId: string, e: React.MouseEvent) => Promise<void>;
  onDownloadHtml: (report: SavedReport) => void;
}

const SavedContentTabs: React.FC<SavedContentTabsProps> = ({
  reports,
  predictions,
  selectedReport,
  selectedPrediction,
  onSelectReport,
  onSelectPrediction,
  onDeleteReport,
  onDeletePrediction,
  onDownloadHtml
}) => {
  return (
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
          onSelectReport={onSelectReport}
          onDeleteReport={onDeleteReport}
          onDownloadHtml={onDownloadHtml}
        />
      </TabsContent>
      
      <TabsContent value="predictions" className="space-y-6 animate-fade-in">
        <PredictionsTabContent
          predictions={predictions}
          selectedPrediction={selectedPrediction}
          onSelectPrediction={onSelectPrediction}
          onDeletePrediction={onDeletePrediction}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SavedContentTabs;
