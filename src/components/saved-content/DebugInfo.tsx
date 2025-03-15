
import React from "react";
import { SavedReport } from "@/hooks/saved-content/useSavedReports";
import { SavedPrediction } from "@/hooks/saved-content/useSavedPredictions";

interface DebugInfoProps {
  userId: string | undefined;
  reports: SavedReport[];
  predictions: SavedPrediction[];
}

const DebugInfo: React.FC<DebugInfoProps> = ({ userId, reports, predictions }) => {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }
  
  return (
    <div className="mt-10 p-4 border rounded bg-gray-50 text-xs font-mono">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div>User ID: {userId || 'Not logged in'}</div>
      <div>Reports: {reports.length}</div>
      <div>Predictions: {predictions.length}</div>
      {reports.length > 0 && (
        <div className="mt-1">
          <div>First report: {reports[0].id} - {reports[0].symbol}</div>
          <div>HTML content: {reports[0].html_content ? 'YES' : 'NO'}</div>
          <div>Report data sample: {JSON.stringify(reports[0].report_data).substring(0, 100)}...</div>
        </div>
      )}
      {predictions.length > 0 && (
        <div className="mt-1">
          <div>First prediction: {predictions[0].id} - {predictions[0].symbol}</div>
          <div>Prediction data sample: {JSON.stringify(predictions[0].prediction_data).substring(0, 100)}...</div>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;
