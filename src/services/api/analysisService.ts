
import { invokeSupabaseFunction } from "./base";
import { ReportRequest, ResearchReport, StockPrediction, NewsArticle, StockQuote } from "@/types";

/**
 * Generate research report
 */
export const generateResearchReport = async (reportRequest: ReportRequest): Promise<ResearchReport | null> => {
  try {
    const data = await invokeSupabaseFunction<ResearchReport>('generate-research-report', { 
      reportRequest 
    });
    
    if (!data) return null;
    return data;
  } catch (error) {
    console.error("Error generating research report:", error);
    return null;
  }
};

/**
 * Generate stock price prediction
 */
export const generateStockPrediction = async (
  symbol: string, 
  stockData: StockQuote, 
  financials: any, 
  news: NewsArticle[]
): Promise<StockPrediction | null> => {
  try {
    const data = await invokeSupabaseFunction<StockPrediction>('predict-stock-price', { 
      symbol, 
      stockData, 
      financials, 
      news 
    });
    
    if (!data) return null;
    return data;
  } catch (error) {
    console.error("Error generating stock prediction:", error);
    return null;
  }
};
