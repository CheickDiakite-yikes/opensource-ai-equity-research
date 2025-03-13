
import { useState, useEffect, useCallback } from "react";
import { 
  getUserPricePredictions,
  deletePricePrediction,
  savePricePrediction 
} from "@/services/api/userContent";
import { testConnection, getConnectionStatus, getDiagnosticInfo } from "@/services/api/userContent/baseService";
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
  const [lastError, setLastError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());
  const { user, isLoading, setIsLoading, error, setError, checkUserLoggedIn } = useSavedContentBase();

  // Periodic connection check
  useEffect(() => {
    const checkConnection = async () => {
      const status = await testConnection();
      setConnectionStatus(status);
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const clearErrors = useCallback(() => {
    setError(null);
    setLastError(null);
    setDebugInfo(null);
  }, [setError]);

  const fetchPredictions = async () => {
    if (!checkUserLoggedIn()) {
      setPredictions([]);
      return;
    }

    console.log("Fetching predictions for user:", user.id);
    setIsLoading(true);
    clearErrors();
    
    try {
      // Get diagnostic info to help with debugging
      const diagnostics = await getDiagnosticInfo();
      setDebugInfo(diagnostics);
      
      if (!diagnostics.connected) {
        setError("Database connection error");
        setLastError(diagnostics.lastError || "Could not connect to database");
        setPredictions([]);
        setIsLoading(false);
        return;
      }
      
      if (diagnostics.authStatus !== 'authenticated') {
        setError("Authentication error");
        setLastError("User is not authenticated");
        setPredictions([]);
        setIsLoading(false);
        return;
      }
      
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
              }
            } as StockPrediction
          };
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
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrediction = async (predictionId: string) => {
    console.log("Deleting prediction:", predictionId);
    try {
      const status = await testConnection();
      setConnectionStatus(status);
      
      if (status !== 'connected') {
        toast.error("Cannot delete prediction: Database connection error");
        return false;
      }
      
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
    } catch (err) {
      console.error("Error in deletePrediction:", err);
      toast.error("Failed to delete prediction due to an error");
      setLastError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  const savePrediction = async (symbol: string, companyName: string, predictionData: StockPrediction) => {
    console.log("Saving prediction for:", symbol, companyName);
    
    try {
      const status = await testConnection();
      setConnectionStatus(status);
      
      if (status !== 'connected') {
        toast.error("Cannot save prediction: Database connection error");
        return null;
      }
      
      const predictionId = await savePricePrediction(symbol, companyName, predictionData);
      console.log("Save result - prediction ID:", predictionId);
      
      if (predictionId) {
        // Refresh predictions list after saving
        console.log("Prediction saved successfully, refreshing predictions list");
        await fetchPredictions();
      } else {
        console.error("Failed to save prediction - no ID returned");
      }
      return predictionId;
    } catch (err) {
      console.error("Error in savePrediction:", err);
      toast.error("Failed to save prediction due to an unexpected error");
      setLastError(err instanceof Error ? err.message : String(err));
      return null;
    }
  };

  // Fetch predictions when the component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("useSavedPredictions useEffect - fetching predictions");
      fetchPredictions();
    }
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
    clearErrors
  };
};
