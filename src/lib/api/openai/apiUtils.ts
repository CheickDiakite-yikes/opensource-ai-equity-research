
/**
 * Common utilities for OpenAI API interactions
 */

import { toast } from "sonner";

// API key from environment variable
export const API_KEY = "sk-svcacct-QXmC18RcbnAvXNtmGOvU-xtV6O5Ds1_Qv-3WLMhxHcXriCw6FQTsGWZFNSJ3VT3BlbkFJIOwO9pVDw8Qj1X27LH_Dyf3cJZUpRIXftpAPKt-tL6plF0fIWy7iQpmGmd-AA";
export const API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Function to call OpenAI API
 */
export async function callOpenAI(messages: any[], temperature: number = 0.7) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("OpenAI API error:", error);
    toast.error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
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
