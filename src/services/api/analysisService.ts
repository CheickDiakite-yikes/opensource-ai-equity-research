
import { invokeSupabaseFunction } from "./base";
import { CustomDCFParams, CustomDCFResult, GrowthInsight, ResearchReport, StockPrediction } from "@/types/aiAnalysisTypes";
import { EarningsCall, SECFiling } from "@/types";
import { NewsArticle, StockQuote } from "@/types";

/**
 * Fetch custom DCF calculation based on user-defined parameters
 */
export const fetchCustomDCF = async (symbol: string, params: CustomDCFParams): Promise<CustomDCFResult[]> => {
  try {
    console.log(`Fetching custom DCF for ${symbol} with params:`, params);
    
    const data = await invokeSupabaseFunction<CustomDCFResult[]>('get-custom-dcf', { 
      symbol, 
      params 
    });
    
    if (!data) {
      console.error("No data returned from custom DCF API");
      return [];
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from custom DCF API:", data);
      return [];
    }
    
    console.log(`Received ${data.length} DCF records for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error fetching custom DCF:", error);
    throw error;
  }
};

/**
 * Analyze growth insights from earnings calls and SEC filings
 */
export const analyzeGrowthInsights = async (
  symbol: string,
  transcripts: EarningsCall[],
  filings: SECFiling[]
): Promise<GrowthInsight[]> => {
  try {
    console.log(`Analyzing growth insights for ${symbol}`);
    
    const data = await invokeSupabaseFunction<GrowthInsight[]>('analyze-growth-insights', {
      symbol,
      transcripts,
      filings
    });
    
    if (!data || !Array.isArray(data)) {
      console.error("Invalid response from growth insights analysis:", data);
      return [];
    }
    
    console.log(`Received ${data.length} growth insights for ${symbol}`);
    return data;
  } catch (error) {
    console.error("Error analyzing growth insights:", error);
    return [];
  }
};

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
