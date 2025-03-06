
import { useState } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { generateStockPrediction } from "@/services/api/analysis/researchService";
import { fetchStockQuote } from "@/services/api/profileService";
import { fetchAllFinancialData } from "@/services/api/financialService";
import { fetchMarketNews } from "@/services/api/marketData/newsService";
import { NewsArticle } from "@/types/news/newsTypes";
import { PredictionHistoryEntry } from "./types";

interface PredictionGeneratorParams {
  symbol: string;
  quickMode: boolean;
}

/**
 * Hook to generate stock price predictions
 */
export const usePredictionGenerator = ({ symbol, quickMode }: PredictionGeneratorParams) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if we should use a recent prediction from history
   */
  const shouldUseRecentPrediction = (
    historyData: PredictionHistoryEntry[], 
    useQuickMode: boolean
  ): PredictionHistoryEntry | null => {
    if (historyData.length === 0 || useQuickMode) return null;
    
    const recentPrediction = historyData.find(p => {
      const predictionDate = new Date(p.prediction_date);
      const now = new Date();
      const hoursSinceGeneration = (now.getTime() - predictionDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceGeneration < 24;
    });
    
    return recentPrediction || null;
  };

  /**
   * Format a historical prediction entry to StockPrediction format
   */
  const formatHistoricalPrediction = (entry: PredictionHistoryEntry): StockPrediction => {
    return {
      symbol: entry.symbol,
      currentPrice: entry.current_price,
      predictedPrice: {
        oneMonth: entry.one_month_price,
        threeMonths: entry.three_month_price,
        sixMonths: entry.six_month_price,
        oneYear: entry.one_year_price
      },
      sentimentAnalysis: entry.sentiment_analysis || '',
      confidenceLevel: entry.confidence_level || 75,
      // Ensure these are arrays
      keyDrivers: Array.isArray(entry.key_drivers) ? entry.key_drivers : [],
      risks: Array.isArray(entry.risks) ? entry.risks : []
    };
  };

  /**
   * Generate a new stock prediction
   */
  const generatePrediction = async (
    historyData: PredictionHistoryEntry[]
  ): Promise<StockPrediction | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check for recent prediction we can use
      const recentPrediction = shouldUseRecentPrediction(historyData, quickMode);
      
      if (recentPrediction) {
        console.log(`Using recent prediction for ${symbol} from ${new Date(recentPrediction.prediction_date).toLocaleString()}`);
        return formatHistoricalPrediction(recentPrediction);
      }
      
      // Get required data for prediction
      const [quote, financials, marketNews] = await Promise.all([
        fetchStockQuote(symbol).catch(err => {
          console.error(`Error fetching quote for ${symbol}:`, err);
          return null;
        }),
        fetchAllFinancialData(symbol).catch(err => {
          console.error(`Error fetching financials for ${symbol}:`, err);
          return {};
        }),
        fetchMarketNews(5, 'general').catch(err => { // Fixed parameter order
          console.error('Error fetching market news:', err);
          return [];
        })
      ]);
      
      if (!quote) {
        throw new Error(`Could not fetch stock data for ${symbol}`);
      }
      
      // Transform marketNews to match the NewsArticle type
      const news: NewsArticle[] = marketNews.map(item => ({
        symbol: symbol, // Add the required symbol property
        publishedDate: item.publishedDate || '',
        title: item.title || item.headline || '',
        image: item.image || '',
        site: item.site || item.source || '',
        text: item.text || item.summary || '',
        url: item.url || ''
      }));
      
      // Generate the prediction
      const result = await generateStockPrediction(symbol, quote, financials, news, quickMode);
      
      if (!result) {
        throw new Error(`Failed to generate prediction for ${symbol}`);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || `Failed to generate prediction for ${symbol}`;
      setError(errorMessage);
      console.error(`Error generating prediction for ${symbol}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    generatePrediction
  };
};
