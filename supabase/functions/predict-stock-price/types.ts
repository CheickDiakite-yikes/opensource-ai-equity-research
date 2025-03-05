
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

export interface FormattedData {
  symbol: string;
  currentPrice: number;
  financialSummary: Record<string, any>;
  technicalIndicators: Record<string, any>;
  newsSummary: Record<string, any>;
  quickMode?: boolean;
  industry?: string;
}
