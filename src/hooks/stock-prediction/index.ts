
import { usePredictionGenerator } from "./usePredictionGenerator";
import { usePredictionHistory } from "./usePredictionHistory";
import { usePredictionSaving } from "./usePredictionSaving";
import type { PredictionHistoryEntry } from "./types";
import { useState } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";

export type { PredictionHistoryEntry };

// Enhanced hook that combines prediction generation with auto-saving
export const useStockPrediction = (symbol: string, companyName: string) => {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const basePrediction = usePredictionGenerator({ symbol, quickMode: false });
  const { autoSavePrediction, isSaving } = usePredictionSaving();
  
  // Extend the generatePrediction function to auto-save the result
  const generatePrediction = async (quickMode: boolean = false) => {
    const basePredictionWithQuickMode = quickMode ? 
      usePredictionGenerator({ symbol, quickMode }) : 
      basePrediction;
      
    const result = await basePredictionWithQuickMode.generatePrediction([]);
    
    if (result) {
      // Auto-save the prediction
      console.log("Prediction generated, auto-saving...");
      await autoSavePrediction(symbol, companyName, result);
      setPrediction(result);
    }
    
    return result;
  };
  
  return {
    ...basePrediction,
    prediction,
    generatePrediction,
    isSaving
  };
};

export { usePredictionHistory, usePredictionSaving };
