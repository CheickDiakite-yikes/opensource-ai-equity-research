
import { useState } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { savePricePrediction } from "@/services/api/userContent";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const usePredictionSaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedPredictionId, setSavedPredictionId] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Auto save a generated prediction
   */
  const autoSavePrediction = async (
    symbol: string,
    companyName: string,
    prediction: StockPrediction
  ): Promise<string | null> => {
    // Skip if not logged in
    if (!user) {
      console.log("User not logged in, skipping auto-save");
      return null;
    }

    try {
      setIsSaving(true);
      console.log("Auto-saving prediction for:", symbol);
      
      const predictionId = await savePricePrediction(symbol, companyName, prediction);
      
      if (predictionId) {
        console.log("Prediction auto-saved successfully, ID:", predictionId);
        setSavedPredictionId(predictionId);
        toast.success(`Price prediction for ${symbol} saved to your account`);
      } else {
        console.error("Failed to auto-save prediction");
      }
      
      return predictionId;
    } catch (error) {
      console.error("Error auto-saving prediction:", error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    savedPredictionId,
    autoSavePrediction
  };
};
