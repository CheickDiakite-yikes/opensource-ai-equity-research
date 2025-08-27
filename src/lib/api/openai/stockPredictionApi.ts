
/**
 * OpenAI API for stock price prediction
 */

import { toast } from "sonner";
import { StockPrediction, StockQuote } from "@/types";
import { callOpenAI, formatFinancialsForPrompt } from "./apiUtils";

/**
 * Generate AI-based stock prediction
 */
export async function generateStockPrediction(
  symbol: string,
  companyName: string,
  quote: StockQuote,
  income: any[],
  ratios: any[],
  news: string[]
): Promise<StockPrediction> {
  // This function is deprecated for security reasons
  // Direct OpenAI API calls with hardcoded keys are disabled
  // Use the proper edge function implementation in services/api/analysis/researchService.ts
  console.error("Direct OpenAI stock prediction generation is disabled for security. Use edge function implementation.");
  toast.error("Direct API calls disabled for security. Use proper backend integration.");
  throw new Error("Direct OpenAI API calls disabled for security");
}
