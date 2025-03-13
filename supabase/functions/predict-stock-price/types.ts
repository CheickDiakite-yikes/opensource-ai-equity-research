
export interface StockPrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
  sentimentAnalysis: string;
  confidenceLevel: number;
  keyDrivers: string[];
  risks: string[];
}

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

export interface FormattedData {
  symbol: string;
  currentPrice: number;
  financialSummary: Record<string, any>;
  technicalIndicators: Record<string, any>;
  newsSummary: Record<string, any>;
  quickMode?: boolean;
  industry?: string;
  predictionHistory?: PredictionHistoryEntry[];
}
