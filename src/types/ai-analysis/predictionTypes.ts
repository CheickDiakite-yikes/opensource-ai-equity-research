
/**
 * Stock Price Prediction
 */
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

/**
 * Growth Insight
 */
export interface GrowthInsight {
  id: string;
  symbol: string;
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  confidence: number;
  source?: string;
  category?: string;
  timeframe?: "short-term" | "medium-term" | "long-term";
}
