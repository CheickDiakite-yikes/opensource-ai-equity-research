
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSavedContentBase } from "./useSavedContentBase";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { savePricePrediction, getUserPricePredictions, deletePricePrediction } from "@/services/api/userContent";

export type SavedPrediction = {
  id: string;
  symbol: string;
  company_name: string;
  created_at: string;
  prediction_data: StockPrediction;
  user_id: string;
  updated_at?: string;
  expires_at?: string | null;
};

export const useSavedPredictions = () => {
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const { user, isLoading, setIsLoading, isRefreshing, setIsRefreshing, error, setError, checkUserLoggedIn } = useSavedContentBase();

  const fetchPredictions = useCallback(async () => {
    const isLoggedIn = await checkUserLoggedIn();
    if (!isLoggedIn) return;

    try {
      setIsRefreshing(true);
      const predictionsList = await getUserPricePredictions();
      console.log(`Fetched ${predictionsList.length} predictions`);
      setPredictions(predictionsList as unknown as SavedPrediction[]);
    } catch (err: any) {
      console.error("Error fetching predictions:", err);
      setError(err.message || "Failed to load saved predictions");
      toast.error("Could not load your saved predictions");
    } finally {
      setIsRefreshing(false);
    }
  }, [checkUserLoggedIn, setIsRefreshing, setError]);

  const savePrediction = useCallback(async (
    symbol: string,
    companyName: string,
    predictionData: StockPrediction
  ): Promise<string | null> => {
    const isLoggedIn = await checkUserLoggedIn();
    if (!isLoggedIn) return null;

    try {
      setIsLoading(true);
      const predictionId = await savePricePrediction(symbol, companyName, predictionData);
      if (predictionId) {
        toast.success("Prediction saved successfully");
        fetchPredictions();
      }
      return predictionId;
    } catch (err: any) {
      console.error("Error saving prediction:", err);
      toast.error("Could not save prediction: " + (err.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkUserLoggedIn, fetchPredictions, setIsLoading]);

  const deletePrediction = useCallback(async (predictionId: string): Promise<boolean> => {
    const isLoggedIn = await checkUserLoggedIn();
    if (!isLoggedIn) return false;

    try {
      setIsLoading(true);
      const success = await deletePricePrediction(predictionId);
      if (success) {
        toast.success("Prediction deleted successfully");
        setPredictions(prevPredictions => prevPredictions.filter(p => p.id !== predictionId));
      }
      return success;
    } catch (err: any) {
      console.error("Error deleting prediction:", err);
      toast.error("Could not delete prediction: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkUserLoggedIn, setIsLoading]);

  return {
    predictions,
    isLoading,
    isRefreshing,
    error,
    fetchPredictions,
    savePrediction,
    deletePrediction
  };
};
