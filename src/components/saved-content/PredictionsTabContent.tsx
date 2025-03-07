
import React from "react";
import { Card } from "@/components/ui/card";
import { SavedPrediction } from "@/hooks/useSavedContent";
import SavedPredictionsList from "./SavedPredictionsList";
import EmptyContentState from "./EmptyContentState";
import ContentPlaceholder from "./ContentPlaceholder";
import SavedContentDisclaimer from "./SavedContentDisclaimer";
import PricePredictionDisplay from "@/components/reports/PricePredictionDisplay";

interface PredictionsTabContentProps {
  predictions: SavedPrediction[];
  selectedPrediction: SavedPrediction | null;
  onSelectPrediction: (prediction: SavedPrediction) => void;
  onDeletePrediction: (predictionId: string, e: React.MouseEvent) => Promise<void>;
}

const PredictionsTabContent: React.FC<PredictionsTabContentProps> = ({
  predictions,
  selectedPrediction,
  onSelectPrediction,
  onDeletePrediction,
}) => {
  if (predictions.length === 0) {
    return <EmptyContentState type="predictions" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-4">
        <h2 className="text-xl font-medium">Your Predictions</h2>
        
        <SavedPredictionsList
          predictions={predictions}
          selectedPrediction={selectedPrediction}
          onSelectPrediction={onSelectPrediction}
          onDeletePrediction={onDeletePrediction}
        />
        
        <SavedContentDisclaimer type="predictions" />
      </div>
      
      <div className="col-span-1 lg:col-span-2">
        {selectedPrediction ? (
          <Card className="p-4">
            <PricePredictionDisplay prediction={selectedPrediction.prediction_data} />
          </Card>
        ) : (
          <ContentPlaceholder type="prediction" />
        )}
      </div>
    </div>
  );
};

export default PredictionsTabContent;
