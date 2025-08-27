
/**
 * Common utilities for OpenAI API interactions
 */

import { toast } from "sonner";

// This file is deprecated for security reasons
// Direct OpenAI API calls with hardcoded keys are disabled
// All AI functionality should use Supabase edge functions
export const API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Calls the o3-mini model first (which doesn't support temperature)
 * and, if that fails, falls back to GPT-4o.
 *
 * @param messages - Array of message objects in [{role, content}, ...] format
 * @param reasoningEffort - "low" | "medium" | "high"; controls how many reasoning tokens are used
 * @param maxOutputTokens - The maximum number of output tokens from o3-mini (not counting hidden reasoning tokens)
 */
export async function callOpenAI(
  messages: any[],
  reasoningEffort: "low" | "medium" | "high" = "medium",
  maxOutputTokens = 150
) {
  // Direct OpenAI API calls are disabled for security reasons
  // All AI functionality should use Supabase edge functions instead
  console.error("Direct OpenAI API calls are disabled for security. Use Supabase edge functions instead.");
  toast.error("Direct API calls disabled for security. Use proper backend integration.");
  throw new Error("Direct OpenAI API calls disabled for security");
}

/**
 * Format financial numbers for better readability in prompts
 */
export function formatFinancialNumber(num: number): string {
  if (num === undefined || num === null) return 'N/A';
  
  if (Math.abs(num) >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (Math.abs(num) >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (Math.abs(num) >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}

/**
 * Format company financials for the prompt
 */
export function formatFinancialsForPrompt(
  income: any[], 
  ratios: any[]
): string {
  let result = "Financial Highlights:\n";
  
  // Get the most recent statements
  const latestIncome = income.length > 0 ? income[0] : null;
  const previousIncome = income.length > 1 ? income[1] : null;
  const latestRatio = ratios.length > 0 ? ratios[0] : null;
  
  if (latestIncome) {
    result += `Revenue: ${formatFinancialNumber(latestIncome.revenue)}`;
    
    if (previousIncome) {
      const revenueDiff = ((latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue * 100).toFixed(2);
      result += ` (${Number(revenueDiff) >= 0 ? '+' : ''}${revenueDiff}% YoY)\n`;
    } else {
      result += "\n";
    }
    
    result += `Net Income: ${formatFinancialNumber(latestIncome.netIncome)}`;
    
    if (previousIncome) {
      const netIncomeDiff = ((latestIncome.netIncome - previousIncome.netIncome) / previousIncome.netIncome * 100).toFixed(2);
      result += ` (${Number(netIncomeDiff) >= 0 ? '+' : ''}${netIncomeDiff}% YoY)\n`;
    } else {
      result += "\n";
    }
    
    result += `EPS: ${formatFinancialNumber(latestIncome.eps)}`;
    
    if (previousIncome) {
      const epsDiff = ((latestIncome.eps - previousIncome.eps) / previousIncome.eps * 100).toFixed(2);
      result += ` (${Number(epsDiff) >= 0 ? '+' : ''}${epsDiff}% YoY)\n`;
    } else {
      result += "\n";
    }
  }
  
  if (latestRatio) {
    result += `P/E Ratio: ${latestRatio.priceEarningsRatio ? latestRatio.priceEarningsRatio.toFixed(2) : 'N/A'}\n`;
    result += `Return on Equity: ${latestRatio.returnOnEquity ? (latestRatio.returnOnEquity * 100).toFixed(2) + '%' : 'N/A'}\n`;
    result += `Profit Margin: ${latestRatio.netProfitMargin ? (latestRatio.netProfitMargin * 100).toFixed(2) + '%' : 'N/A'}\n`;
    result += `Debt to Equity: ${latestRatio.debtEquityRatio ? latestRatio.debtEquityRatio.toFixed(2) : 'N/A'}\n`;
  }
  
  return result;
}
