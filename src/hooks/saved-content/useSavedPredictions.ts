
import { useState, useEffect } from "react";
import { 
  getUserPricePredictions,
  deletePricePrediction,
  savePricePrediction 
} from "@/services/api/userContent";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { useSavedContentBase } from "./useSavedContentBase";
import { toast } from "sonner";

export interface SavedPrediction {
  id: string;
  symbol: string;
  company_name: string;
  prediction_data: StockPrediction;
  created_at: string;
  expires_at: string;
}

export const useSavedPredictions = () => {
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const { user, isLoading, setIsLoading, error, setError, checkUserLoggedIn } = useSavedContentBase();

  const fetchPredictions = async () => {
    if (!checkUserLoggedIn()) {
      setPredictions([]);
      return;
    }

    console.log("Fetching predictions for user:", user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserPricePredictions();
      
      console.log("Raw data from getUserPricePredictions:", data);
      
      if (data.length === 0) {
        console.log("No predictions found for user");
        setPredictions([]);
        setIsLoading(false);
        return;
      }
      
      // Convert Json type to StockPrediction type with type assertion
      const convertedPredictions = data.map(item => {
        console.log(`Processing prediction ${item.id}:`, {
          symbol: item.symbol,
          company_name: item.company_name,
          created_at: item.created_at,
          expires_at: item.expires_at
        });
        
        // Validate prediction_data
        if (!item.prediction_data) {
          console.error(`Prediction ${item.id} has no prediction_data!`);
        }
        
        return {
          ...item,
          prediction_data: item.prediction_data as unknown as StockPrediction
        };
      }) as SavedPrediction[];
      
      console.log(`Fetched ${convertedPredictions.length} predictions`);
      setPredictions(convertedPredictions);
    } catch (err) {
      console.error("Error fetching saved predictions:", err);
      setError("Failed to load saved predictions");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrediction = async (predictionId: string) => {
    console.log("Deleting prediction:", predictionId);
    const success = await deletePricePrediction(predictionId);
    if (success) {
      console.log("Prediction deleted successfully, updating state");
      setPredictions(prevPredictions => 
        prevPredictions.filter(prediction => prediction.id !== predictionId)
      );
    } else {
      console.error("Failed to delete prediction");
    }
    return success;
  };

  const savePrediction = async (symbol: string, companyName: string, predictionData: StockPrediction) => {
    console.log("Saving prediction for:", symbol, companyName);
    const predictionId = await savePricePrediction(symbol, companyName, predictionData);
    console.log("Save result - prediction ID:", predictionId);
    
    if (predictionId) {
      // Refresh predictions list after saving
      console.log("Prediction saved successfully, refreshing predictions list");
      fetchPredictions();
    } else {
      console.error("Failed to save prediction - no ID returned");
    }
    return predictionId;
  };

  // Fetch predictions when the component mounts or user changes
  useEffect(() => {
    console.log("useSavedPredictions useEffect - fetching predictions");
    fetchPredictions();
  }, [user]);

  return { 
    predictions, 
    isLoading, 
    error, 
    fetchPredictions, 
    deletePrediction, 
    savePrediction 
  };
};
