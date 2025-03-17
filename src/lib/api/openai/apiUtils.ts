
/**
 * OpenAI API Utilities
 */

import { toast } from "sonner";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

type ReasoningEffort = "low" | "medium" | "high";

/**
 * Call OpenAI API with proper error handling and retries
 */
export async function callOpenAI(
  messages: Message[],
  reasoningEffort: ReasoningEffort = "medium",
  maxRetries: number = 3
): Promise<any> {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      console.log(`Calling OpenAI API (attempt ${retries + 1}/${maxRetries})...`);
      
      // For o3-mini model, we need to use the new reasoning-oriented parameters
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Use gpt-4o-mini as it's available and supported
          messages: messages,
          temperature: 0.2, // Lower temperature for more factual responses
          reasoning: { effort: reasoningEffort }, // Use reasoning effort parameter
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API returned ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("OpenAI API response received successfully");
      return data;
    } catch (error) {
      console.error(`OpenAI API call failed (attempt ${retries + 1}/${maxRetries}):`, error);
      lastError = error;
      retries++;
      if (retries < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.floor(Math.random() * 1000 + 1000 * Math.pow(2, retries));
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // We've exhausted our retries, show an error notification and throw the last error
  toast.error("Failed to generate AI content after multiple attempts");
  throw lastError;
}

/**
 * Format financials for OpenAI prompts
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

/**
 * Format a financial number for display (e.g., 1234567 -> $1.23M)
 */
export function formatFinancialNumber(num: number): string {
  if (num === undefined || num === null) return 'N/A';
  
  if (Math.abs(num) >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (Math.abs(num) >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(num) >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}
