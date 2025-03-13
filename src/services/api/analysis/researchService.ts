
import { invokeSupabaseFunction } from "../base";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { NewsArticle, StockQuote } from "@/types";

/**
 * Generate an AI research report for a company
 */
export const generateResearchReport = async (reportRequest: any): Promise<ResearchReport> => {
  try {
    console.log(`Generating research report for ${reportRequest.symbol}`);
    
    const data = await invokeSupabaseFunction<ResearchReport>('generate-research-report', {
      reportRequest
    });
    
    if (!data) {
      console.error("No data returned from research report API");
      throw new Error("Failed to generate research report");
    }
    
    console.log(`Research report generated for ${reportRequest.symbol} with ${data.sections?.length || 0} sections`);
    return data;
  } catch (error) {
    console.error("Error generating research report:", error);
    throw error;
  }
};

/**
 * Generate AI stock price prediction
 */
export const generateStockPrediction = async (
  symbol: string,
  quote: StockQuote,
  financials: any,
  news: NewsArticle[]
): Promise<StockPrediction> => {
  try {
    console.log(`Generating stock prediction for ${symbol}`);
    
    const data = await invokeSupabaseFunction<StockPrediction>('predict-stock-price', {
      symbol,
      stockData: quote,
      financials,
      news
    });
    
    if (!data) {
      console.error("No data returned from stock prediction API");
      throw new Error("Failed to generate stock prediction");
    }
    
    console.log(`Stock prediction generated for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error generating stock prediction:", error);
    throw error;
  }
};

/**
 * Save an AI research report to the database
 */
export const saveResearchReport = async (
  symbol: string,
  companyName: string,
  report: ResearchReport
): Promise<void> => {
  try {
    console.log(`Saving research report for ${symbol}`);
    
    await invokeSupabaseFunction('save-ai-analysis', {
      type: 'report',
      symbol,
      companyName,
      data: report
    });
    
    console.log(`Research report saved for ${symbol}`);
  } catch (error) {
    console.error("Error saving research report:", error);
    throw error;
  }
};

/**
 * Save an AI stock price prediction to the database
 */
export const savePricePrediction = async (
  symbol: string,
  companyName: string,
  prediction: StockPrediction
): Promise<void> => {
  try {
    console.log(`Saving price prediction for ${symbol}`);
    
    await invokeSupabaseFunction('save-ai-analysis', {
      type: 'prediction',
      symbol,
      companyName,
      data: prediction
    });
    
    console.log(`Price prediction saved for ${symbol}`);
  } catch (error) {
    console.error("Error saving price prediction:", error);
    throw error;
  }
};
