
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";

export interface SavedPrediction {
  id: string;
  symbol: string;
  company_name: string;
  prediction_data: StockPrediction;
  created_at: string;
  expires_at: string;
}

export interface UsePredictionsState {
  predictions: SavedPrediction[];
  isLoading: boolean;
  error: string | null;
  lastError: string | null;
  debugInfo: any;
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
  retryCount: number;
}
