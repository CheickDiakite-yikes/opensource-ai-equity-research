
import { useState, useEffect } from "react";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { generateStockPrediction } from "@/services/api/analysis/researchService";
import { fetchStockQuote } from "@/services/api/profileService";
import { fetchAllFinancialData } from "@/services/api/financialService";
import { fetchMarketNews } from "@/services/api/marketData/newsService";
import { toast } from "@/components/ui/use-toast";
import { NewsArticle } from "@/types/news/newsTypes";

export const useStockPrediction = (symbol: string, autoFetch: boolean = false, quickMode: boolean = true) => {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 2;

  const generatePrediction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
    isLoading,
    error,
    generatePrediction,
    retry: () => {
      setRetryCount(0); // Reset retry count
      return generatePrediction();
    }
  };
};
