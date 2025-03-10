
import { StockPrediction, FormattedData } from "./types.ts";
import { generatePredictionWithOpenAI } from "./openaiService.ts";

export { generatePredictionWithOpenAI };

// Add enhanced industry context for better predictions
export const getIndustryContext = (industry: string): string => {
  switch(industry.toLowerCase()) {
    case 'technology':
      return 'high growth potential with significant volatility due to rapid innovation';
    case 'healthcare':
      return 'moderate growth with defensive characteristics and regulatory factors';
    case 'financials':
      return 'sensitivity to interest rates and economic cycles with moderate growth';
    case 'consumer staples':
      return 'stable growth with defensive characteristics and lower volatility';
    case 'energy':
      return 'cyclical performance heavily influenced by commodity prices';
    case 'utilities':
      return 'stable income with regulatory constraints and modest growth';
    case 'industrials':
      return 'moderate growth tied to economic cycles and capex trends';
    case 'materials':
      return 'cyclical performance with sensitivity to global economic activity';
    case 'real estate':
      return 'income-oriented with sensitivity to interest rates and regional trends';
    case 'communication services':
      return 'evolving growth profile with mixture of legacy and technology segments';
    default:
      return 'varied performance metrics dependent on specific business model';
  }
};

// Enhanced prediction function that uses analyst estimates
export const enhancePredictionWithAnalystEstimates = (prediction: StockPrediction, analystEstimates: any[]): StockPrediction => {
  if (!analystEstimates || !Array.isArray(analystEstimates) || analystEstimates.length === 0) {
    return prediction;
  }

  try {
    // Get the most recent analyst estimate
    const latestEstimate = analystEstimates[0];
    
    // Calculate EPS growth from analyst estimates
    const epsGrowth = latestEstimate.epsAvg > 0 ? 
      ((prediction.currentPrice * (1 + (latestEstimate.epsAvg / 100))) / prediction.currentPrice) - 1 : 0;
    
    // Enhance 1-year prediction with analyst EPS forecast influence (50% weight)
    if (epsGrowth !== 0) {
      const currentOneYearPrediction = prediction.predictedPrice.oneYear;
      const analystInfluencedPrediction = prediction.currentPrice * (1 + epsGrowth);
      
      // Blend the predictions (50% current prediction, 50% analyst-based)
      prediction.predictedPrice.oneYear = parseFloat(
        ((currentOneYearPrediction * 0.5) + (analystInfluencedPrediction * 0.5)).toFixed(2)
      );
      
      // Add analyst data to the prediction for reference
      prediction.analystData = {
        epsAvg: latestEstimate.epsAvg,
        revenueAvg: latestEstimate.revenueAvg,
        targetDate: latestEstimate.date,
        analystCount: latestEstimate.numberAnalystEstimated
      };
    }
    
    return prediction;
  } catch (error) {
    console.error("Error enhancing prediction with analyst estimates:", error);
    return prediction;
  }
};

// Enhanced prediction with recommendation trends
export const enhancePredictionWithRecommendationTrends = (prediction: StockPrediction, recommendationTrends: any[]): StockPrediction => {
  if (!recommendationTrends || !Array.isArray(recommendationTrends) || recommendationTrends.length === 0) {
    return prediction;
  }

  try {
    // Get the most recent recommendation trend
    const latestTrend = recommendationTrends[0];
    
    // Calculate sentiment score from recommendation trends
    // strongBuy: +2, buy: +1, hold: 0, sell: -1, strongSell: -2
    const totalRecommendations = 
      latestTrend.strongBuy + 
      latestTrend.buy + 
      latestTrend.hold + 
      latestTrend.sell + 
      latestTrend.strongSell;
    
    if (totalRecommendations > 0) {
      const sentimentScore = 
        (latestTrend.strongBuy * 2 + 
        latestTrend.buy * 1 + 
        latestTrend.hold * 0 + 
        latestTrend.sell * -1 + 
        latestTrend.strongSell * -2) / totalRecommendations;
      
      // Add the recommendation data to the prediction
      prediction.marketSentiment = {
        score: parseFloat(sentimentScore.toFixed(2)),
        strongBuy: latestTrend.strongBuy,
        buy: latestTrend.buy,
        hold: latestTrend.hold,
        sell: latestTrend.sell,
        strongSell: latestTrend.strongSell,
        period: latestTrend.period,
        totalRecommendations
      };
      
      // Adjust the confidence level based on sentiment (0-10% adjustment)
      const sentimentAdjustment = Math.min(Math.abs(sentimentScore) * 5, 10);
      if (sentimentScore > 0) {
        prediction.confidenceLevel = Math.min(prediction.confidenceLevel + sentimentAdjustment, 100);
      } else if (sentimentScore < 0) {
        prediction.confidenceLevel = Math.max(prediction.confidenceLevel - sentimentAdjustment, 0);
      }
    }
    
    return prediction;
  } catch (error) {
    console.error("Error enhancing prediction with recommendation trends:", error);
    return prediction;
  }
};

// Enhanced prediction with enterprise value
export const enhancePredictionWithEnterpriseValue = (prediction: StockPrediction, enterpriseValue: any[]): StockPrediction => {
  if (!enterpriseValue || !Array.isArray(enterpriseValue) || enterpriseValue.length === 0) {
    return prediction;
  }

  try {
    // Get the most recent enterprise value data
    const latestEV = enterpriseValue[0];
    
    // Add enterprise value data to the prediction
    prediction.fundamentals = {
      ...(prediction.fundamentals || {}),
      enterpriseValue: latestEV.enterpriseValue,
      evToMarketCap: latestEV.enterpriseValue / latestEV.marketCapitalization,
      totalDebt: latestEV.addTotalDebt,
      cashAndEquivalents: latestEV.minusCashAndCashEquivalents
    };
    
    return prediction;
  } catch (error) {
    console.error("Error enhancing prediction with enterprise value:", error);
    return prediction;
  }
};

// Enhanced prediction with upcoming earnings
export const enhancePredictionWithEarningsCalendar = (prediction: StockPrediction, earningsCalendar: any): StockPrediction => {
  if (!earningsCalendar || !earningsCalendar.earningsCalendar || !Array.isArray(earningsCalendar.earningsCalendar)) {
    return prediction;
  }

  try {
    // Filter earnings for the specific stock
    const stockEarnings = earningsCalendar.earningsCalendar.filter(
      (entry: any) => entry.symbol.toUpperCase() === prediction.symbol.toUpperCase()
    );
    
    if (stockEarnings.length > 0) {
      // Sort by date, most recent first
      stockEarnings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Get the upcoming earnings date (if available)
      const upcomingEarnings = stockEarnings.find((entry: any) => new Date(entry.date) >= new Date());
      
      if (upcomingEarnings) {
        prediction.upcomingCatalysts = [
          ...(prediction.upcomingCatalysts || []),
          `Earnings release on ${upcomingEarnings.date} (Est. EPS: $${upcomingEarnings.epsEstimate}, Est. Revenue: $${(upcomingEarnings.revenueEstimate / 1000000000).toFixed(2)}B)`
        ];
      }
      
      // Add past earnings data if available
      const pastEarnings = stockEarnings.find((entry: any) => new Date(entry.date) < new Date());
      
      if (pastEarnings) {
        prediction.earningsData = {
          recentEarningsDate: pastEarnings.date,
          recentEpsActual: pastEarnings.epsActual,
          recentEpsEstimate: pastEarnings.epsEstimate,
          recentEpsSurprise: pastEarnings.epsActual - pastEarnings.epsEstimate,
          recentRevenueActual: pastEarnings.revenueActual,
          recentRevenueEstimate: pastEarnings.revenueEstimate
        };
      }
    }
    
    return prediction;
  } catch (error) {
    console.error("Error enhancing prediction with earnings calendar:", error);
    return prediction;
  }
};
