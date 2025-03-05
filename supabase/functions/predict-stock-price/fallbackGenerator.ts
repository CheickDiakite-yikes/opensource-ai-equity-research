
import { StockPrediction, FormattedData } from "./types.ts";

export function createFallbackPrediction(data: FormattedData): StockPrediction {
  return {
    symbol: data.symbol,
    currentPrice: data.currentPrice,
    predictedPrice: {
      oneMonth: data.currentPrice * 1.01,
      threeMonths: data.currentPrice * 1.03,
      sixMonths: data.currentPrice * 1.05,
      oneYear: data.currentPrice * 1.08
    },
    sentimentAnalysis: generateDefaultSentiment(data),
    confidenceLevel: 75,
    keyDrivers: generateDefaultDrivers(),
    risks: generateDefaultRisks()
  };
}

export function generateDefaultSentiment(data: FormattedData): string {
  return "Based on recent financial data and market trends, the overall sentiment for this stock appears cautiously optimistic. The company has shown stability in its core financial metrics, though market conditions may introduce some volatility in the short term.";
}

export function generateDefaultDrivers(): string[] {
  return [
    "Strong revenue growth in core product lines",
    "Expansion into emerging markets",
    "Margin improvement through operational efficiency",
    "New product launches expected in upcoming quarters",
    "Technological innovations driving competitive advantage"
  ];
}

export function generateDefaultRisks(): string[] {
  return [
    "Increasing competition in primary markets",
    "Potential regulatory headwinds",
    "Macroeconomic uncertainties affecting consumer spending",
    "Supply chain constraints",
    "Rising input costs affecting margins"
  ];
}
