
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
  financialSummary: any;
  technicalIndicators: any;
  newsSummary: any;
  quickMode?: boolean;
}
