
import { usePredictionGenerator } from "./usePredictionGenerator";
import { usePredictionHistory } from "./usePredictionHistory";
import { usePredictionSaving } from "./usePredictionSaving";
import type { PredictionHistoryEntry } from "./types";

export type { PredictionHistoryEntry };

// Enhanced hook that combines prediction generation with auto-saving
export const useStockPrediction = (symbol: string, companyName: string) => {
  const basePrediction = usePredictionGenerator({ symbol, quickMode: false });
  const { autoSavePrediction, isSaving } = usePredictionSaving();
  
  // Extend the generatePrediction function to auto-save the result
  const generatePrediction = async (quickMode: boolean = false) => {
    const basePredictionWithQuickMode = quickMode ? 
      usePredictionGenerator({ symbol, quickMode }) : 
      basePrediction;
      
    const prediction = await basePredictionWithQuickMode.generatePrediction([]);
    
    if (prediction) {
      // Auto-save the prediction
      console.log("Prediction generated, auto-saving...");
      await autoSavePrediction(symbol, companyName, prediction);
    }
    
    return prediction;
  };
  
  return {
    ...basePrediction,
    generatePrediction,
    isSaving
  };
};

export { usePredictionHistory, usePredictionSaving };
