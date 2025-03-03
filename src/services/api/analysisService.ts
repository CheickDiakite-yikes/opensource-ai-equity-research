
import { invokeSupabaseFunction, withRetry } from "./base";
import { ReportRequest, ResearchReport, StockPrediction, NewsArticle, StockQuote, CustomDCFParams, CustomDCFResult, EarningsCall, SECFiling } from "@/types";
import { toast } from "@/components/ui/use-toast";

/**
 * Generate research report with enhanced error handling and report type
 */
export const generateResearchReport = async (
  reportRequest: ReportRequest, 
  reportType: string = "comprehensive"
): Promise<ResearchReport | null> => {
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
    
    console.log(`Generating ${reportType} research report for ${reportRequest.symbol}`);
    
    // Use retry logic for AI report generation
    const data = await withRetry(() => 
      invokeSupabaseFunction<ResearchReport>('generate-research-report', { 
        reportRequest,
        reportType // Pass the report type to guide AI generation
      }),
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
      invokeSupabaseFunction<CustomDCFResult>('get-stock-data', {
        symbol,
        endpoint: 'custom-levered-dcf',
        params
      }),
      1, // fewer retries for this operation
      1000 // shorter initial delay
    );
    
    if (!data) {
      console.error("Failed to generate custom DCF");
      return null;
    }
    
    // Transform the API response if needed
    // For now, we'll just return the data directly
    return data;
  } catch (error) {
    console.error("Error generating custom DCF:", error);
    return null;
  }
};

/**
 * Analyze growth insights from earnings calls and SEC filings
 */
export const analyzeGrowthInsights = async (
  symbol: string,
  transcripts: EarningsCall[],
  filings: SECFiling[]
): Promise<any[] | null> => {
  try {
    // Check if we have data to analyze
    if ((!transcripts || transcripts.length === 0) && (!filings || filings.length === 0)) {
      console.warn(`No transcripts or filings available for ${symbol}`);
      return [];
    }

    console.log(`Analyzing growth insights for ${symbol} from ${transcripts.length} transcripts and ${filings.length} filings`);
    
    // Use retry logic for AI analysis
    const data = await withRetry(() => 
      invokeSupabaseFunction<any[]>('analyze-growth-insights', { 
        symbol,
        transcripts,
        filings
      }),
      2,  // Try up to 2 times
      1500 // Wait 1.5 seconds between retries
    );
    
    if (!data) {
      console.error("Failed to analyze growth insights");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error analyzing growth insights:", error);
    toast({
      title: "Analysis Failed",
      description: "Could not analyze growth data. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};
