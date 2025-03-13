
import React from "react";
import { SavedReport, SavedPrediction } from "@/hooks/saved-content";
import { motion } from "framer-motion";
import SavedContentHeader from "@/components/saved-content/SavedContentHeader";
import SavedContentTabs from "@/components/saved-content/SavedContentTabs";

interface SavedContentMainProps {
  userEmail: string | null;
  isRefreshing: boolean;
  reports: SavedReport[];
  predictions: SavedPrediction[];
  selectedReport: SavedReport | null;
  selectedPrediction: SavedPrediction | null;
  onRefresh: () => void;
  onSelectReport: (report: SavedReport) => void;
  onSelectPrediction: (prediction: SavedPrediction) => void;
  onDeleteReport: (reportId: string, e: React.MouseEvent) => Promise<void>;
  onDeletePrediction: (predictionId: string, e: React.MouseEvent) => Promise<void>;
  onDownloadHtml: (report: SavedReport) => void;
}

const SavedContentMain: React.FC<SavedContentMainProps> = ({
  userEmail,
  isRefreshing,
  reports,
  predictions,
  selectedReport,
  selectedPrediction,
  onRefresh,
  onSelectReport,
  onSelectPrediction,
  onDeleteReport,
  onDeletePrediction,
  onDownloadHtml
}) => {
  return (
    <motion.div 
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container max-w-7xl mx-auto py-8 px-4"
    >
      <SavedContentHeader 
        userEmail={userEmail}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      
      <SavedContentTabs
        reports={reports}
        predictions={predictions}
        selectedReport={selectedReport}
        selectedPrediction={selectedPrediction}
        onSelectReport={onSelectReport}
        onSelectPrediction={onSelectPrediction}
        onDeleteReport={onDeleteReport}
        onDeletePrediction={onDeletePrediction}
        onDownloadHtml={onDownloadHtml}
      />
    </motion.div>
  );
};

export default SavedContentMain;
