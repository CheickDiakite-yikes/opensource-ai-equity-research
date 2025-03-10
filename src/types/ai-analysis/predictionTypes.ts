
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
  // New fields for enhanced prediction
  marketSentiment?: {
    score: number;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
    period: string;
    totalRecommendations: number;
  };
  fundamentals?: {
    enterpriseValue: number;
    evToMarketCap: number;
    totalDebt: number;
    cashAndEquivalents: number;
  };
  analystData?: {
    epsAvg: number;
    revenueAvg: number;
    targetDate: string;
    analystCount: number;
  };
  earningsData?: {
    recentEarningsDate: string;
    recentEpsActual: number;
    recentEpsEstimate: number;
    recentEpsSurprise: number;
    recentRevenueActual: number;
    recentRevenueEstimate: number;
  };
  upcomingCatalysts?: string[];
}
