
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { SavedPrediction } from "@/hooks/useSavedContent";
import { motion } from "framer-motion";

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
    <div className="divide-y divide-border/40">
      {predictions.map((prediction, index) => {
        const isPositive = prediction.prediction_data.predictedPrice.oneYear > prediction.prediction_data.currentPrice;
        const percentChange = ((prediction.prediction_data.predictedPrice.oneYear - prediction.prediction_data.currentPrice) / prediction.prediction_data.currentPrice) * 100;
        
        return (
          <motion.div 
            key={prediction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`cursor-pointer group p-4 hover:bg-primary/5 transition-all ${
              selectedPrediction?.id === prediction.id ? 'bg-primary/10' : ''
            }`}
            onClick={() => onSelectPrediction(prediction)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-base font-medium ${
                  selectedPrediction?.id === prediction.id ? 'text-primary' : ''
                }`}>
                  {prediction.symbol}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {prediction.company_name}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{Math.abs(percentChange).toFixed(1)}%</span>
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={(e) => onDeletePrediction(prediction.id, e)}
                  title="Delete prediction"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs">
              <div className="font-medium">
                Current: ${prediction.prediction_data.currentPrice.toFixed(2)}
              </div>
              <div className={`font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                1Y: ${prediction.prediction_data.predictedPrice.oneYear.toFixed(2)}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SavedPredictionsList;
