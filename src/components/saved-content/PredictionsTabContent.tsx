
import React from "react";
import { Card } from "@/components/ui/card";
import { SavedPrediction } from "@/hooks/saved-content";
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-primary/90">Your Predictions</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {predictions.length} saved
          </span>
        </div>
        
        <div className="bg-gradient-to-r from-background to-secondary/30 p-0.5 rounded-xl shadow-sm">
          <div className="bg-background rounded-lg overflow-hidden">
            <SavedPredictionsList
              predictions={predictions}
              selectedPrediction={selectedPrediction}
              onSelectPrediction={onSelectPrediction}
              onDeletePrediction={onDeletePrediction}
            />
          </div>
        </div>
        
        <SavedContentDisclaimer type="predictions" />
      </div>
      
      <div className="col-span-1 lg:col-span-2 transition-all duration-300">
        {selectedPrediction ? (
          <Card className="p-5 h-full overflow-hidden border border-primary/5 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-background to-secondary/10">
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
