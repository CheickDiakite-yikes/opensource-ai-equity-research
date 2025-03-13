
import { FormattedData } from "./types.ts";

export function formatDataForPrediction(
  symbol: string,
  stockData: any,
  financials: any = {},
  news: any[] = []
): FormattedData {
  console.log(`Formatting data for prediction: ${symbol}`);

  // Format key financial metrics
  const financialSummary = extractFinancialSummary(financials);

  // Format technical indicators
  const technicalIndicators = extractTechnicalIndicators(stockData);

  // Format news sentiment
  const newsSummary = summarizeNews(news);

  return {
    symbol,
    currentPrice: stockData.price,
    financialSummary,
    technicalIndicators,
    newsSummary
  };
}

function extractFinancialSummary(financials: any = {}): Record<string, any> {
  if (!financials || !financials.income || !Array.isArray(financials.income)) {
    return {
      revenueGrowth: "Unknown",
      profitMargin: "Unknown",
      peRatio: "Unknown"
    };
  }

  try {
    const incomeStatements = financials.income;
    
    // Sort by date descending to get latest first
    const sortedIncome = [...incomeStatements].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Get last two years of data if available
    const latestYear = sortedIncome[0];
    const previousYear = sortedIncome[1];
    
    // Calculate growth metrics if we have sufficient data
    let revenueGrowth = "Unknown";
    let profitMargin = "Unknown";
    let peRatio = "Unknown";
    let marketCap = "Unknown";
    
    if (latestYear) {
      if (latestYear.revenue && latestYear.netIncome) {
        profitMargin = latestYear.netIncome / latestYear.revenue;
      }
      
      if (latestYear.eps && latestYear.price) {
        peRatio = latestYear.price / latestYear.eps;
      }
      
      if (previousYear && latestYear.revenue && previousYear.revenue) {
        revenueGrowth = (latestYear.revenue - previousYear.revenue) / previousYear.revenue;
      }
    }
    
    return {
      revenueGrowth: typeof revenueGrowth === 'number' ? revenueGrowth : "Unknown",
      profitMargin: typeof profitMargin === 'number' ? profitMargin : "Unknown",
      peRatio: typeof peRatio === 'number' ? peRatio : "Unknown",
      marketCap: financials.marketCap || "Unknown",
      currentRevenue: latestYear?.revenue || "Unknown",
      currentProfit: latestYear?.netIncome || "Unknown",
      currentEPS: latestYear?.eps || "Unknown"
    };
  } catch (error) {
    console.error(`Error extracting financial summary: ${error}`);
    return {
      revenueGrowth: "Unknown",
      profitMargin: "Unknown",
      peRatio: "Unknown",
      error: String(error)
    };
  }
}

function extractTechnicalIndicators(stockData: any): Record<string, any> {
  try {
    return {
      price: stockData.price,
      priceChange24h: stockData.change,
      percentChange24h: stockData.changesPercentage,
      dayHigh: stockData.dayHigh,
      dayLow: stockData.dayLow,
      yearHigh: stockData.yearHigh,
      yearLow: stockData.yearLow,
      priceAvg50: stockData.priceAvg50,
      priceAvg200: stockData.priceAvg200,
      volume: stockData.volume,
      avgVolume: stockData.avgVolume
    };
  } catch (error) {
    console.error(`Error extracting technical indicators: ${error}`);
    return {
      price: stockData.price,
      error: String(error)
    };
  }
}

function summarizeNews(news: any[] = []): Record<string, any> {
  if (!news || news.length === 0) {
    return {
      recentHeadlines: [],
      sentimentScore: "neutral"
    };
  }

  try {
    // Extract up to 5 most recent headlines
    const recentHeadlines = news
      .slice(0, 5)
      .map(article => article.title || article.headline || "");
    
    // Simplistic sentiment analysis based on headlines
    const positiveWords = ['rise', 'up', 'growth', 'gain', 'positive', 'beat', 'exceeded', 'strong', 'success'];
    const negativeWords = ['fall', 'down', 'decline', 'loss', 'negative', 'miss', 'weak', 'drop', 'concern'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    recentHeadlines.forEach(headline => {
      const headlineLower = headline.toLowerCase();
      positiveWords.forEach(word => {
        if (headlineLower.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (headlineLower.includes(word)) negativeCount++;
      });
    });
    
    let sentimentScore;
    if (positiveCount > negativeCount) {
      sentimentScore = "positive";
    } else if (negativeCount > positiveCount) {
      sentimentScore = "negative";
    } else {
      sentimentScore = "neutral";
    }
    
    return {
      recentHeadlines,
      sentimentScore,
      articleCount: news.length
    };
  } catch (error) {
    console.error(`Error summarizing news: ${error}`);
    return {
      recentHeadlines: [],
      sentimentScore: "neutral",
      error: String(error)
    };
  }
}
