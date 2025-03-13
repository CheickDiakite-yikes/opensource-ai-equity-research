
import { useState, useEffect, useCallback } from "react";
import { 
  getUserPricePredictions,
  deletePricePrediction,
  savePricePrediction 
} from "@/services/api/userContent";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { useSavedContentBase, SavedContentError } from "./useSavedContentBase";
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
  const {
    user,
    isLoading,
    setIsLoading,
    error,
    setError,
    lastError,
    setLastError,
    checkUserLoggedIn,
    handleError,
    connectionStatus,
    checkConnection,
    debugInfo,
    setDebugInfo,
    clearErrors
  } = useSavedContentBase();

  const fetchPredictions = async () => {
    if (!checkUserLoggedIn()) {
      setPredictions([]);
      return;
    }

    console.log("=== Fetching predictions ===");
    console.log("User:", user.id);
    setIsLoading(true);
    setError(null);
    setDebugInfo("Fetching predictions from database");
    
    // Check connection first
    const isConnected = await checkConnection();
    if (!isConnected) {
      setError("Cannot fetch predictions: disconnected from database");
      setIsLoading(false);
      return;
    }
    
    try {
      const data = await getUserPricePredictions();
      
      // Debug logging
      console.log("Raw data from getUserPricePredictions:", data);
      setDebugInfo(prev => `${prev}\nRetrieved ${data.length} predictions from database`);
      
      if (data.length === 0) {
        console.log("No predictions found for user");
        setPredictions([]);
        setIsLoading(false);
        return;
      }
      
      // Convert Json type to StockPrediction type with type assertion
      const convertedPredictions = data.map(item => {
        setDebugInfo(prev => `${prev}\nProcessing prediction ${item.id}: ${item.symbol}`);
        console.log(`Processing prediction ${item.id}:`, {
          symbol: item.symbol,
          company_name: item.company_name,
          created_at: item.created_at,
          expires_at: item.expires_at
        });
        
        // Validate prediction_data
        if (!item.prediction_data) {
          const errorMsg = `Prediction ${item.id} has no prediction_data!`;
          console.error(errorMsg);
          setDebugInfo(prev => `${prev}\nERROR: ${errorMsg}`);
        }
        
        try {
          return {
            ...item,
            prediction_data: item.prediction_data as unknown as StockPrediction
          };
        } catch (parseError) {
          const errorMsg = `Error parsing prediction ${item.id}: ${String(parseError)}`;
          console.error(errorMsg);
          setDebugInfo(prev => `${prev}\nERROR: ${errorMsg}`);
          
          // Return with basic prediction data structure to prevent crashes
          return {
            ...item,
            prediction_data: {
              symbol: item.symbol,
              currentPrice: 0,
              predictedPrice: {
                oneMonth: 0,
                threeMonths: 0,
                sixMonths: 0,
                oneYear: 0
              },
              sentimentAnalysis: "Error parsing data",
              confidenceLevel: 0,
              keyDrivers: ["Error parsing data"],
              risks: ["Error parsing data"]
            } as StockPrediction
          };
        }
      }) as SavedPrediction[];
      
      // More debug
      console.log(`Fetched ${convertedPredictions.length} predictions`);
      setDebugInfo(prev => `${prev}\nSuccessfully processed ${convertedPredictions.length} predictions`);
      
      setPredictions(convertedPredictions);
    } catch (err) {
      const errorInfo = handleError(err, "fetchPredictions", "Failed to load saved predictions");
      setDebugInfo(`Error: ${errorInfo.message}\nDetails: ${JSON.stringify(errorInfo.details)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrediction = async (predictionId: string) => {
    console.log("=== Deleting prediction ===");
    console.log("Prediction ID:", predictionId);
    setDebugInfo(`Attempting to delete prediction: ${predictionId}`);
    
    // Check connection first
    const isConnected = await checkConnection();
    if (!isConnected) {
      const msg = "Cannot delete prediction: disconnected from database";
      setError(msg);
      toast.error(msg);
      return false;
    }
    
    try {
      const success = await deletePricePrediction(predictionId);
      if (success) {
        console.log("Prediction deleted successfully, updating state");
        setPredictions(prevPredictions => 
          prevPredictions.filter(prediction => prediction.id !== predictionId)
        );
        setDebugInfo(prev => `${prev}\nSuccessfully deleted prediction ${predictionId}`);
      } else {
        console.error("Failed to delete prediction");
        setDebugInfo(prev => `${prev}\nFailed to delete prediction ${predictionId}`);
      }
      return success;
    } catch (err) {
      const errorInfo = handleError(err, "deletePrediction", "Failed to delete prediction");
      setDebugInfo(prev => `${prev}\nError deleting prediction: ${JSON.stringify(errorInfo)}`);
      return false;
    }
  };

  const savePrediction = async (symbol: string, companyName: string, predictionData: StockPrediction) => {
    console.log("=== Saving prediction ===");
    console.log("Symbol:", symbol);
    console.log("Company:", companyName);
    setDebugInfo(`Attempting to save prediction for: ${symbol} (${companyName})`);
    
    // Check connection first
    const isConnected = await checkConnection();
    if (!isConnected) {
      const msg = "Cannot save prediction: disconnected from database";
      setError(msg);
      toast.error(msg);
      return null;
    }
    
    try {
      const predictionId = await savePricePrediction(symbol, companyName, predictionData);
      console.log("Save result - prediction ID:", predictionId);
      setDebugInfo(prev => `${prev}\nSave result - prediction ID: ${predictionId || 'FAILED'}`);
      
      if (predictionId) {
        // Refresh predictions list after saving
        console.log("Prediction saved successfully, refreshing predictions list");
        setDebugInfo(prev => `${prev}\nPrediction saved successfully, refreshing list`);
        await fetchPredictions();
      } else {
        console.error("Failed to save prediction - no ID returned");
        setDebugInfo(prev => `${prev}\nFailed to save prediction - no ID returned`);
      }
      return predictionId;
    } catch (err) {
      const errorInfo = handleError(err, "savePrediction", "Failed to save prediction");
      setDebugInfo(prev => `${prev}\nError saving prediction: ${JSON.stringify(errorInfo)}`);
      return null;
    }
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
    lastError,
    debugInfo,
    connectionStatus,
    fetchPredictions, 
    deletePrediction, 
    savePrediction,
    checkConnection,
    clearErrors
  };
};
