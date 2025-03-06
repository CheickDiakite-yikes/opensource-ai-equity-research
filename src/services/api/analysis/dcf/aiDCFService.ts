
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
    pe: number;
    marketCap: number;
    lastDividend: number;
    volume: number;
    exchange: string;
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
    
    const response = await invokeSupabaseFunction<AIDCFResult>('ai-dcf', { symbol });
    
    if (!response) {
      console.error(`No response from AI-DCF service for ${symbol}`);
      throw new Error("Failed to fetch AI-DCF data");
    }
    
    console.log(`Received AI-DCF response for ${symbol}:`, response);
    
    return response;
  } catch (error) {
    console.error("Error fetching AI-DCF:", error);
    
    toast({
      title: "AI-DCF Error",
      description: error instanceof Error ? error.message : "Failed to generate AI-powered DCF",
      variant: "destructive",
    });
    
    throw error;
  }
};
