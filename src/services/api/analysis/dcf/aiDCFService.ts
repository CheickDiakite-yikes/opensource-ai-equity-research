
import { invokeSupabaseFunction } from "../../base";
import { toast } from "@/components/ui/use-toast";

export interface AIDCFResult {
  ticker: string;
  companyName?: string;
  sector?: string;
  industry?: string;
  assumptions: {
    averageRevenueGrowth: number;
    wacc: number;
    terminalGrowth: number;
    beta?: number;
    taxRate?: number;
  };
  projectedFCFs: number[];
  terminalValue: number;
  dcfValue: number;
  enterpriseValue: number;
  equityValue: number;
  sharesOutstanding: number;
  intrinsicValuePerShare: number;
  currentPrice: number | null;
  upside: number | null;
  timestamp: string;
  aiGenerated: boolean;
  industryComparison?: {
    revenueGrowth: { company: number; industry: number; difference: string };
    profitMargin: { company: number; industry: number; difference: string };
    debtRatio: { company: number; industry: number; difference: string };
  };
  scenarioAnalysis?: {
    base: { growthRate: number; wacc: number; intrinsicValue: number };
    bullish: { growth: number; wacc: number; intrinsicValue: number };
    bearish: { growth: number; wacc: number; intrinsicValue: number };
  };
  keyMetrics?: {
    pe?: number;
    marketCap?: number;
    lastDividend?: number;
    volume?: number;
    exchange?: string;
  };
}

/**
 * Fetch AI-powered DCF analysis for a given symbol
 */
export const fetchAIDCF = async (symbol: string): Promise<AIDCFResult> => {
  if (!symbol || symbol.trim() === "") {
    toast({
      title: "Symbol Required",
      description: "Please provide a valid stock symbol for DCF calculation",
      variant: "destructive",
    });
    throw new Error("Symbol is required for AI-DCF calculation");
  }
  
  try {
    console.log(`Requesting AI-powered DCF for ${symbol}`);
    
    // Add a timeout of 30 seconds to prevent the request from hanging indefinitely
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000);
    });

    // Race the actual request against the timeout
    const response = await Promise.race([
      invokeSupabaseFunction<AIDCFResult>('ai-dcf', { symbol }),
      timeoutPromise
    ]) as AIDCFResult;
    
    if (!response) {
      console.error(`No response from AI-DCF service for ${symbol}`);
      throw new Error("Failed to fetch AI-DCF data");
    }
    
    // Validate the response to ensure it has all required fields
    if (!response.assumptions || !response.projectedFCFs || response.intrinsicValuePerShare === undefined) {
      console.error(`Invalid AI-DCF response for ${symbol}:`, response);
      throw new Error("Invalid DCF data returned - missing required fields");
    }
    
    // Make sure any potential undefined fields are initialized with default values
    if (!response.keyMetrics) {
      response.keyMetrics = {};
    }
    
    // Ensure all numeric values that will be formatted with toFixed() are actual numbers
    if (response.upside === null || response.upside === undefined) {
      response.upside = 0;
    }
    
    if (response.currentPrice === null || response.currentPrice === undefined) {
      response.currentPrice = 0;
    }
    
    // Ensure scenario analysis exists
    if (!response.scenarioAnalysis) {
      response.scenarioAnalysis = {
        base: { growthRate: response.assumptions.averageRevenueGrowth, wacc: response.assumptions.wacc, intrinsicValue: response.intrinsicValuePerShare },
        bullish: { growth: response.assumptions.averageRevenueGrowth * 1.2, wacc: response.assumptions.wacc * 0.9, intrinsicValue: response.intrinsicValuePerShare * 1.2 },
        bearish: { growth: response.assumptions.averageRevenueGrowth * 0.8, wacc: response.assumptions.wacc * 1.1, intrinsicValue: response.intrinsicValuePerShare * 0.8 }
      };
    }
    
    console.log(`Received AI-DCF response for ${symbol}:`, response);
    
    return response;
  } catch (error) {
    console.error("Error fetching AI-DCF:", error);
    
    // Provide more informative error messages based on the error type
    let errorMessage = error instanceof Error ? error.message : "Failed to generate AI-powered DCF";
    
    // Handle specific error cases
    if (errorMessage.includes("timed out")) {
      errorMessage = "Request timed out. The DCF calculation may be taking too long. Please try again later.";
    } else if (errorMessage.includes("No DCF data returned")) {
      errorMessage = "The financial data provider couldn't generate a DCF model for this stock. This may happen for some smaller or recently listed companies.";
    } else if (errorMessage.includes("404")) {
      errorMessage = "The stock symbol provided could not be found. Please check the symbol and try again.";
    } else if (errorMessage.includes("rate limit")) {
      errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
    }
    
    toast({
      title: "AI-DCF Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw new Error(errorMessage);
  }
};
