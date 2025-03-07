
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedPrediction } from "@/hooks/useSavedContent";

interface SavedPredictionsListProps {
  predictions: SavedPrediction[];
  selectedPrediction: SavedPrediction | null;
  onSelectPrediction: (prediction: SavedPrediction) => void;
  onDeletePrediction: (predictionId: string, e: React.MouseEvent) => Promise<void>;
}

const SavedPredictionsList: React.FC<SavedPredictionsListProps> = ({
  predictions,
  selectedPrediction,
  onSelectPrediction,
  onDeletePrediction,
}) => {
  return (
    <div className="space-y-3">
      {predictions.map((prediction) => (
        <Card 
          key={prediction.id} 
          className={`cursor-pointer hover:border-primary/50 transition-colors ${
            selectedPrediction?.id === prediction.id ? 'border-primary' : ''
          }`}
          onClick={() => onSelectPrediction(prediction)}
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
                onClick={(e) => onDeletePrediction(prediction.id, e)}
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
  );
};

export default SavedPredictionsList;
