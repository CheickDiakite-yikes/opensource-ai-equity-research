
import { useEffect, useCallback } from "react";
import { testConnection, getConnectionStatus } from "@/services/api/userContent/baseService";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { useSavedContentBase } from "./useSavedContentBase";
import { usePredictionsState } from "./state/usePredictionsState";
import { 
  fetchUserPredictions, 
  removeUserPrediction, 
  saveUserPrediction,
  getDatabaseStatus
} from "./api/predictionApi";
import { SavedPrediction } from "./types/predictionTypes";
import { toast } from "sonner";

export type { SavedPrediction };

export const useSavedPredictions = () => {
  const [
    { predictions, isLoading, error, lastError, debugInfo, connectionStatus, retryCount },
    { 
      setPredictions, setIsLoading, setError, setLastError, 
      setDebugInfo, setConnectionStatus, setRetryCount, clearErrors 
    }
  ] = usePredictionsState();
  
  const { user, setIsLoading: setBaseIsLoading, setError: setBaseError, checkUserLoggedIn } = useSavedContentBase();

  // Periodic connection check
  useEffect(() => {
    const checkConnection = async () => {
      const status = await testConnection();
      setConnectionStatus(status);
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [setConnectionStatus]);

  const fetchPredictions = async () => {
    if (!checkUserLoggedIn()) {
      setPredictions([]);
      return;
    }

    console.log("Fetching predictions for user:", user.id);
    setIsLoading(true);
    clearErrors();
    
    try {
      // Get connection status and diagnostic info
      const { status, diagnostics } = await getDatabaseStatus();
      setConnectionStatus(status);
      setDebugInfo(diagnostics);
      
      if (status !== 'connected') {
        setError("Database connection error");
        setLastError("Cannot connect to database. Please check your internet connection.");
        setPredictions([]);
        setIsLoading(false);
        return;
      }
      
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
      
      const data = await fetchUserPredictions();
      setPredictions(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Error fetching saved predictions:", err);
      setError("Failed to load saved predictions");
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrediction = async (predictionId: string) => {
    try {
      const success = await removeUserPrediction(predictionId);
      if (success) {
        console.log("Prediction deleted successfully, updating state");
        setPredictions(prevPredictions => 
          prevPredictions.filter(prediction => prediction.id !== predictionId)
        );
      }
      return success;
    } catch (err) {
      console.error("Error in deletePrediction:", err);
      setLastError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  const savePrediction = async (symbol: string, companyName: string, predictionData: StockPrediction) => {
    try {
      const predictionId = await saveUserPrediction(symbol, companyName, predictionData);
      
      if (predictionId) {
        // Refresh predictions list after saving
        console.log("Prediction saved successfully, refreshing predictions list");
        await fetchPredictions();
        return predictionId;
      } else {
        console.error("Failed to save prediction - no ID returned");
        
        // Auto-retry once after a short delay
        if (retryCount < 1) {
          setRetryCount(prev => prev + 1);
          toast.info("Retrying save operation...");
          
          // Wait a moment and try again
          await new Promise(resolve => setTimeout(resolve, 1500));
          return saveUserPrediction(symbol, companyName, predictionData);
        }
        
        return null;
      }
    } catch (err) {
      console.error("Error in savePrediction:", err);
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
