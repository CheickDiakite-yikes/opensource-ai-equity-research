
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

export interface GrowthInsight {
  type: "positive" | "negative" | "neutral";
  source: "earnings" | "filing" | "analysis";
  sourceDate: string;
  content: string;
}
