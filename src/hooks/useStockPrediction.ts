
// This file is now a re-export from the refactored module
import { useStockPrediction } from "./stock-prediction";
import type { PredictionHistoryEntry } from "./stock-prediction";

export type { PredictionHistoryEntry };
export { useStockPrediction };
export default useStockPrediction;
