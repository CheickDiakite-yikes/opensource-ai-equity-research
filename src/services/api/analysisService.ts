
import { invokeSupabaseFunction, withRetry } from "./base";
import { ReportRequest, ResearchReport, StockPrediction, NewsArticle, StockQuote, CustomDCFParams, CustomDCFResult } from "@/types";
import { toast } from "@/components/ui/use-toast";

/**
 * Generate research report with enhanced error handling
 */
export const generateResearchReport = async (reportRequest: ReportRequest): Promise<ResearchReport | null> => {
  try {
    // Validate input data
    if (!reportRequest.symbol || !reportRequest.companyName) {
      console.error("Invalid report request - missing required fields");
      toast({
        title: "Error",
        description: "Missing required data for report generation",
        variant: "destructive",
      });
      return null;
    }
    
    console.log(`Generating research report for ${reportRequest.symbol}`);
    
    // Use retry logic for AI report generation
    const data = await withRetry(() => 
      invokeSupabaseFunction<ResearchReport>('generate-research-report', { reportRequest }),
      2, // fewer retries for this expensive operation
      2000 // longer initial delay
    );
    
    if (!data) {
      console.error("Failed to generate research report");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error generating research report:", error);
    toast({
      title: "Report Generation Failed",
      description: "Could not generate the research report. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Generate stock price prediction with enhanced error handling
 */
export const generateStockPrediction = async (
  symbol: string, 
  stockData: StockQuote, 
  financials: any, 
  news: NewsArticle[]
): Promise<StockPrediction | null> => {
  try {
    // Validate input data
    if (!symbol || !stockData || !stockData.price) {
      console.error("Invalid prediction request - missing required fields");
      toast({
        title: "Error",
        description: "Missing required data for prediction generation",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if we have sufficient financial data
    const hasFinancials = financials && 
                          financials.income && 
                          financials.income.length > 0 &&
                          financials.balance && 
                          financials.balance.length > 0;
    
    if (!hasFinancials) {
      console.warn(`Limited financial data available for ${symbol}, prediction may be less accurate`);
    }
    
    console.log(`Generating stock prediction for ${symbol}`);
    
    // Use retry logic for AI prediction
    const data = await withRetry(() => 
      invokeSupabaseFunction<StockPrediction>('predict-stock-price', { 
        symbol, 
        stockData, 
        financials, 
        news: news?.slice(0, 20) || [] // Limit news to recent 20 articles
      }),
      2, // fewer retries for this expensive operation
      2000 // longer initial delay
    );
    
    if (!data) {
      console.error("Failed to generate stock prediction");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error generating stock prediction:", error);
    toast({
      title: "Prediction Failed",
      description: "Could not generate the stock prediction. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Fetch custom DCF analysis with provided parameters
 */
export const fetchCustomDCF = async (
  symbol: string,
  params: CustomDCFParams
): Promise<CustomDCFResult | null> => {
  try {
    console.log(`Generating custom DCF for ${symbol} with parameters:`, params);
    
    // Use retry logic for DCF calculation
    const data = await withRetry(() => 
      invokeSupabaseFunction<CustomDCFResult[]>('get-stock-data', {
        symbol,
        endpoint: 'custom-levered-dcf',
        params
      }),
      1, // fewer retries for this operation
      1000 // shorter initial delay
    );
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Failed to generate custom DCF or empty result");
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error("Error generating custom DCF:", error);
    return null;
  }
};
