
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";

export interface PredictionHistoryEntry {
  id: string;
  symbol: string;
  current_price: number;
  one_month_price: number;
  three_month_price: number;
  six_month_price: number;
  one_year_price: number;
  sentiment_analysis: string | null;
  confidence_level: number | null;
  key_drivers: string[] | any; // Accept any JSON type from database
  risks: string[] | any; // Accept any JSON type from database
  prediction_date: string;
  metadata: Record<string, any> | null;
}

export interface StockPredictionHookResult {
  prediction: StockPrediction | null;
  predictionHistory: PredictionHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  generatePrediction: () => Promise<StockPrediction | null>;
  retry: () => Promise<StockPrediction | null>;
}
