
/**
 * Common utilities for OpenAI API interactions
 */

import { toast } from "sonner";

// API key from environment variable
export const API_KEY = "sk-svcacct-QXmC18RcbnAvXNtmGOvU-xtV6O5Ds1_Qv-3WLMhxHcXriCw6FQTsGWZFNSJ3VT3BlbkFJIOwO9pVDw8Qj1X27LH_Dyf3cJZUpRIXftpAPKt-tL6plF0fIWy7iQpmGmd-AA";
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
  // Primary model: o3-mini (reasoning model)
  const primaryModel = "o3-mini";
  // Fallback model: GPT-4o
  const fallbackModel = "gpt-4o";

  // Primary request payload for o3-mini
  // - No temperature or top_p, etc., because reasoning models don't support them
  // - Use reasoning_effort and max_output_tokens as documented
  const primaryPayload = {
    model: primaryModel,
    messages,
    reasoning_effort: reasoningEffort, // "low" | "medium" | "high"
    max_output_tokens: maxOutputTokens, // max tokens for the *final* answer (not counting hidden reasoning tokens)
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(primaryPayload),
    });

    if (!response.ok) {
      const errorResp = await response.json();
      throw new Error(errorResp.error?.message || "o3-mini API request failed");
    }

    return await response.json();
  } catch (primaryError) {
    console.error("Primary model (o3-mini) error:", primaryError);

    // Fallback: GPT-4o, which still supports temperature
    const fallbackPayload = {
      model: fallbackModel,
      messages,
      temperature: 0.7, // you can adjust or remove as needed
      max_tokens: 150,   // standard param name for GPT-4o
    };

    try {
      const fallbackResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(fallbackPayload),
      });

      if (!fallbackResponse.ok) {
        const fallbackErrorResp = await fallbackResponse.json();
        throw new Error(
          fallbackErrorResp.error?.message || "Fallback GPT-4o request failed"
        );
      }

      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error("Fallback model (gpt-4o) error:", fallbackError);
      toast.error(`OpenAI API error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      throw fallbackError;
    }
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
