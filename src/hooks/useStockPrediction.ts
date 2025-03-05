
import { useState, useEffect } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { generateStockPrediction } from "@/services/api/analysis/researchService";
import { fetchStockQuote } from "@/services/api/profileService";
import { fetchAllFinancialData } from "@/services/api/financialService";
import { fetchMarketNews } from "@/services/api/marketData/newsService";
import { toast } from "@/components/ui/use-toast";
import { NewsArticle } from "@/types/news/newsTypes";
import { supabase } from "@/integrations/supabase/client";

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

export const useStockPrediction = (symbol: string, autoFetch: boolean = false, quickMode: boolean = true) => {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 2;

  // Fetch prediction history from the database
  const fetchPredictionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_prediction_history')
        .select('*')
        .eq('symbol', symbol)
        .order('prediction_date', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error(`Error fetching prediction history for ${symbol}:`, error);
        return [];
      }
      
      // Type cast to ensure compatibility
      const typedData = data?.map(item => ({
        ...item,
        key_drivers: Array.isArray(item.key_drivers) ? item.key_drivers : [],
        risks: Array.isArray(item.risks) ? item.risks : []
      })) as PredictionHistoryEntry[];
      
      setHistory(typedData || []);
      return typedData || [];
    } catch (err) {
      console.error(`Error in fetchPredictionHistory for ${symbol}:`, err);
      return [];
    }
  };

  const generatePrediction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch prediction history first
      const historyData = await fetchPredictionHistory();
      
      // If we have recent history (less than 24 hours old), use it instead of generating new prediction
      const recentPrediction = historyData.find(p => {
        const predictionDate = new Date(p.prediction_date);
        const now = new Date();
        const hoursSinceGeneration = (now.getTime() - predictionDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceGeneration < 24;
      });
      
      if (recentPrediction && !quickMode) {
        console.log(`Using recent prediction for ${symbol} from ${new Date(recentPrediction.prediction_date).toLocaleString()}`);
        
        // Convert to StockPrediction format with proper type handling
        const formattedPrediction: StockPrediction = {
          symbol: recentPrediction.symbol,
          currentPrice: recentPrediction.current_price,
          predictedPrice: {
            oneMonth: recentPrediction.one_month_price,
            threeMonths: recentPrediction.three_month_price,
            sixMonths: recentPrediction.six_month_price,
            oneYear: recentPrediction.one_year_price
          },
          sentimentAnalysis: recentPrediction.sentiment_analysis || '',
          confidenceLevel: recentPrediction.confidence_level || 75,
          // Ensure these are arrays
          keyDrivers: Array.isArray(recentPrediction.key_drivers) ? recentPrediction.key_drivers : [],
          risks: Array.isArray(recentPrediction.risks) ? recentPrediction.risks : []
        };
        
        setPrediction(formattedPrediction);
        setRetryCount(0); // Reset retry count on success
        
        return formattedPrediction;
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
        fetchMarketNews(5, 'general').catch(err => {
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
      
      setPrediction(result);
      setRetryCount(0); // Reset retry count on success
      
      return result;
    } catch (err: any) {
      console.error(`Error generating prediction for ${symbol}:`, err);
      
      // Set error message
      setError(err.message || `Failed to generate prediction for ${symbol}`);
      
      // Return null to indicate failure
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-retry on failure if within retry limits
  useEffect(() => {
    if (error && autoFetch && retryCount < MAX_RETRIES) {
      const retryDelay = 3000 * (retryCount + 1); // Exponential backoff
      
      console.log(`Retrying prediction for ${symbol} in ${retryDelay/1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        generatePrediction().catch(err => {
          console.error(`Retry failed for ${symbol}:`, err);
        });
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, autoFetch, retryCount, symbol]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && symbol) {
      generatePrediction().catch(err => {
        console.error(`Auto-fetch prediction error for ${symbol}:`, err);
      });
    }
  }, [symbol, autoFetch]);

  return {
    prediction,
    predictionHistory: history,
    isLoading,
    error,
    generatePrediction,
    retry: () => {
      setRetryCount(0); // Reset retry count
      return generatePrediction();
    }
  };
};
