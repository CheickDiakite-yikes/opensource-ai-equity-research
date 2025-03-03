
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
    
    // Make sure all required fields are present
    const validatedData = data.map(item => {
      // Ensure all required fields are present, defaulting to 0 if missing
      return {
        year: item.year || new Date().getFullYear().toString(),
        symbol: item.symbol || symbol,
        revenue: item.revenue || 0,
        revenuePercentage: item.revenuePercentage || 0,
        ebitda: item.ebitda || 0,
        ebitdaPercentage: item.ebitdaPercentage || 0,
        ebit: item.ebit || 0,
        ebitPercentage: item.ebitPercentage || 0,
        depreciation: item.depreciation || 0,
        capitalExpenditure: item.capitalExpenditure || 0,
        capitalExpenditurePercentage: item.capitalExpenditurePercentage || 0,
        price: item.price || 0,
        beta: item.beta || 0,
        dilutedSharesOutstanding: item.dilutedSharesOutstanding || 0,
        costofDebt: item.costofDebt || 0,
        taxRate: item.taxRate || 0,
        afterTaxCostOfDebt: item.afterTaxCostOfDebt || 0,
        riskFreeRate: item.riskFreeRate || 0,
        marketRiskPremium: item.marketRiskPremium || 0,
        costOfEquity: item.costOfEquity || 0,
        totalDebt: item.totalDebt || 0,
        totalEquity: item.totalEquity || 0,
        totalCapital: item.totalCapital || 0,
        debtWeighting: item.debtWeighting || 0,
        equityWeighting: item.equityWeighting || 0,
        wacc: item.wacc || 0,
        operatingCashFlow: item.operatingCashFlow || 0,
        pvLfcf: item.pvLfcf || 0,
        sumPvLfcf: item.sumPvLfcf || 0,
        longTermGrowthRate: item.longTermGrowthRate || 0,
        freeCashFlow: item.freeCashFlow || 0,
        terminalValue: item.terminalValue || 0,
        presentTerminalValue: item.presentTerminalValue || 0,
        enterpriseValue: item.enterpriseValue || 0,
        netDebt: item.netDebt || 0,
        equityValue: item.equityValue || 0,
        equityValuePerShare: item.equityValuePerShare || 0,
        freeCashFlowT1: item.freeCashFlowT1 || 0,
        operatingCashFlowPercentage: item.operatingCashFlowPercentage || 0
      } as CustomDCFResult;
    });
    
    return validatedData;
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
